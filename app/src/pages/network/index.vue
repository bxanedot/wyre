<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import MdPageShell from '@/components/custom/md-page-shell.vue';
import { METRIC_STATUS_KEYS } from '@/lib/models/system-resources/system-resources';
import { LoggerService } from '@/lib/services/diagnostics/logger-service';
import { ByteSizeService } from '@/lib/services/settings/byte-size-service';
import { ResidentService } from '@/lib/services/resident/resident-service';
import { WyreNetworkService, type NetworkMeasurement } from '@/lib/services/network/wyre-network-service';
import { useTrayPanelStore } from '@/stores/tray-panel-store';

const { t, locale } = useI18n({ useScope: 'global' });
const trayPanelStore = useTrayPanelStore();
const busy = ref(false);
const result = ref<NetworkMeasurement | null>(null);
const error = ref(false);
const networkReading = computed(() => trayPanelStore.reading.network);
const network = computed(() =>
  ['ready', 'stale'].includes(networkReading.value.status) ? networkReading.value.value : null
);
const networkStatus = computed(() => t(METRIC_STATUS_KEYS[networkReading.value.status]));
const connectionStatus = computed(() =>
  network.value
    ? t(network.value.interface.connected ? 'networkDetails.connected' : 'systemStatus.disconnected')
    : networkStatus.value
);
const ipv4Addresses = computed(
  () => network.value?.interface.details?.addresses.filter(address => !address.includes(':')) ?? []
);

let disposed = false;
let unlistenReading: (() => void) | null = null;
onMounted(() => {
  void trayPanelStore.load();
  void ResidentService.onReading(reading => trayPanelStore.accept(reading))
    .then(unlisten => {
      if (disposed) unlisten();
      else unlistenReading = unlisten;
    })
    .catch(cause => LoggerService.warn('network', 'monitor_subscription_failed', { error: cause }));
});
onUnmounted(() => {
  disposed = true;
  unlistenReading?.();
});

function formatRate(bytesPerSecond: number): string {
  return Number.isFinite(bytesPerSecond) && bytesPerSecond >= 0 ? `${ByteSizeService.bytes(bytesPerSecond)}/s` : '—';
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat(locale.value, { maximumFractionDigits: 1 }).format(value);
}

const measurements = computed(() => {
  if (!result.value) return [];
  return [
    { key: 'download', label: t('wyre.download'), value: `${formatNumber(result.value.downloadMbps)} Mbps` },
    { key: 'upload', label: t('wyre.upload'), value: `${formatNumber(result.value.uploadMbps)} Mbps` },
    { key: 'latency', label: t('wyre.latency'), value: `${result.value.latencyMs} ms` },
    { key: 'jitter', label: t('wyre.jitter'), value: `${result.value.jitterMs} ms` },
    { key: 'failedProbes', label: t('wyre.failedProbes'), value: `${result.value.failedProbesPercent}%` },
  ];
});

async function measure() {
  if (busy.value) return;
  busy.value = true;
  error.value = false;
  result.value = null;
  try {
    result.value = await WyreNetworkService.measure();
  } catch (cause) {
    error.value = true;
    LoggerService.warn('network', 'speed_check_failed', { error: cause });
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <MdPageShell :title="t('wyre.networkTitle')" :subtitle="t('wyre.networkDescription')" content-mode="workspace">
    <template #actions>
      <Button :disabled="busy" :aria-busy="busy" @click="measure">
        {{ busy ? t('wyre.networkMeasuring') : t('wyre.networkRun') }}
      </Button>
    </template>

    <div class="grid h-full content-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
      <section class="min-w-0 rounded-xl border bg-card p-5 sm:p-7" :aria-label="t('wyre.networkTestTitle')">
        <header class="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="m-0 text-base font-medium text-foreground">{{ t('wyre.networkTestTitle') }}</h2>
            <p class="mb-0 mt-1 text-sm leading-relaxed text-muted-foreground">
              {{
                result
                  ? t('wyre.networkResultNote', { amount: formatNumber(result.dataMb) })
                  : t('wyre.networkDescription')
              }}
            </p>
          </div>
          <span
            v-if="busy"
            class="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary-text"
            role="status"
            aria-live="polite"
          >
            {{ t('wyre.networkMeasuring') }}
          </span>
        </header>

        <dl v-if="result" class="m-0 grid grid-cols-2 gap-3 lg:grid-cols-6">
          <div
            v-for="item in measurements"
            :key="item.key"
            class="min-w-0 rounded-lg border bg-background p-4"
            :class="item.key === 'download' || item.key === 'upload' ? 'lg:col-span-3' : 'lg:col-span-2'"
          >
            <dt class="text-xs text-muted-foreground">{{ item.label }}</dt>
            <dd class="mb-0 mt-2 truncate text-2xl font-medium tabular-nums text-foreground">{{ item.value }}</dd>
          </div>
        </dl>

        <div
          v-else
          class="grid min-h-64 content-center justify-items-center rounded-lg border border-dashed bg-background px-6 py-10 text-center"
          :class="{ 'border-destructive/40': error }"
          role="status"
          aria-live="polite"
        >
          <span
            class="mb-4 grid size-11 place-items-center rounded-full border bg-primary/10 text-primary-text"
            aria-hidden="true"
          >
            <span class="size-2.5 rounded-full bg-primary" :class="{ 'animate-pulse': busy }"></span>
          </span>
          <h3 class="m-0 text-base font-medium text-foreground">
            {{ error ? t('wyre.networkErrorTitle') : busy ? t('wyre.networkMeasuring') : t('wyre.networkReadyTitle') }}
          </h3>
          <p class="mb-0 mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {{
              error
                ? t('wyre.networkErrorDescription')
                : busy
                  ? t('wyre.networkDescription')
                  : t('wyre.networkReadyDescription')
            }}
          </p>
        </div>
      </section>

      <div class="grid content-start gap-4">
        <section class="min-w-0 rounded-xl border bg-card p-5 sm:p-7" :aria-label="t('wyre.networkCurrentConnection')">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h2 class="m-0 text-base font-medium text-foreground">{{ t('wyre.networkCurrentConnection') }}</h2>
              <p class="mb-0 mt-1 truncate text-sm text-muted-foreground">
                {{ network?.interface.name ?? networkStatus }}
              </p>
            </div>
            <span
              class="shrink-0 rounded-full border px-3 py-1 text-xs"
              :class="
                network?.interface.connected
                  ? 'border-primary/25 bg-primary/10 text-primary-text'
                  : 'bg-muted text-muted-foreground'
              "
            >
              {{ connectionStatus }}
            </span>
          </div>

          <dl class="mb-0 mt-5 grid grid-cols-2 gap-3">
            <div class="min-w-0 rounded-lg border bg-background p-3">
              <dt class="text-xs text-muted-foreground">{{ t('systemStatus.download') }}</dt>
              <dd class="mb-0 mt-2 truncate text-lg font-medium tabular-nums text-foreground">
                {{ network ? formatRate(network.receivedBytesPerSecond) : '—' }}
              </dd>
            </div>
            <div class="min-w-0 rounded-lg border bg-background p-3">
              <dt class="text-xs text-muted-foreground">{{ t('systemStatus.upload') }}</dt>
              <dd class="mb-0 mt-2 truncate text-lg font-medium tabular-nums text-foreground">
                {{ network ? formatRate(network.transmittedBytesPerSecond) : '—' }}
              </dd>
            </div>
          </dl>

          <div v-if="ipv4Addresses.length" class="mt-4 border-t pt-4">
            <p class="mb-1 text-xs text-muted-foreground">IPv4</p>
            <p class="mb-0 break-all font-mono text-sm text-foreground">{{ ipv4Addresses.join(', ') }}</p>
          </div>
          <p v-else class="mb-0 mt-4 text-sm text-muted-foreground" role="status">{{ networkStatus }}</p>
        </section>

        <aside class="rounded-xl border bg-card p-5 sm:p-7">
          <h2 class="m-0 text-base font-medium text-foreground">{{ t('wyre.networkPrivacyTitle') }}</h2>
          <p class="mb-0 mt-2 text-sm leading-relaxed text-muted-foreground">{{ t('wyre.networkPrivacy') }}</p>
        </aside>
      </div>
    </div>
  </MdPageShell>
</template>
