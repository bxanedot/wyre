<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import MdPageShell from '@/components/custom/md-page-shell.vue';
import { WyreNetworkService, type NetworkMeasurement } from '@/lib/services/network/wyre-network-service';
import { LoggerService } from '@/lib/services/diagnostics/logger-service';

const { t } = useI18n({ useScope: 'global' });
const busy = ref(false);
const result = ref<NetworkMeasurement | null>(null);
const error = ref('');

async function measure() {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  try {
    result.value = await WyreNetworkService.measure();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
    LoggerService.warn('network', 'speed_check_failed', { error: cause });
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <MdPageShell :title="t('wyre.networkTitle')" :subtitle="t('wyre.networkDescription')" content-mode="workspace">
    <div class="grid h-full content-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,.85fr)]">
      <section class="rounded-xl border bg-card p-5 sm:p-7">
        <div class="flex justify-end">
          <Button :disabled="busy" :aria-busy="busy" @click="measure">
            {{ busy ? t('wyre.networkMeasuring') : t('wyre.networkRun') }}
          </Button>
        </div>
        <dl class="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-3">
          <div v-for="item in [
            { label: t('wyre.latency'), value: result ? `${result.latencyMs} ms` : '—' },
            { label: t('wyre.jitter'), value: result ? `${result.jitterMs} ms` : '—' },
            { label: t('wyre.download'), value: result ? `${result.downloadMbps} Mbps` : '—' },
            { label: t('wyre.upload'), value: result ? `${result.uploadMbps} Mbps` : '—' },
            { label: t('wyre.failedProbes'), value: result ? `${result.failedProbesPercent}%` : '—' },
          ]" :key="item.label" class="min-w-0 rounded-lg border bg-background p-4">
            <dt class="text-xs text-muted-foreground">{{ item.label }}</dt>
            <dd class="mt-2 mb-0 truncate text-xl font-medium text-foreground">{{ item.value }}</dd>
          </div>
        </dl>
        <p v-if="error" class="mb-0 mt-4 text-sm text-destructive-text" role="alert">{{ error }}</p>
        <p v-else-if="result" class="mb-0 mt-4 text-sm text-muted-foreground" aria-live="polite">
          {{ t('wyre.networkResultNote', { amount: result.dataMb }) }}
        </p>
      </section>
      <aside class="rounded-xl border bg-card p-5 sm:p-7">
        <h2 class="mt-0 text-base font-medium text-foreground">{{ t('wyre.networkPrivacyTitle') }}</h2>
        <p class="mb-0 text-sm leading-relaxed text-muted-foreground">{{ t('wyre.networkPrivacy') }}</p>
      </aside>
    </div>
  </MdPageShell>
</template>
