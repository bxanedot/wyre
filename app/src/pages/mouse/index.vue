<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import MdPageShell from '@/components/custom/md-page-shell.vue';
import { LoggerService } from '@/lib/services/diagnostics/logger-service';
import { WyreMouseService, type WyreMouseSettings } from '@/lib/services/system-settings/wyre-mouse-service';

const { t } = useI18n({ useScope: 'global' });
const current = ref<WyreMouseSettings | null>(null);
const speed = ref(10);
const acceleration = ref(true);
const pending = ref(false);
const busy = ref(false);
const error = ref('');
const notice = ref('');
const undo = ref<WyreMouseSettings | null>(null);
const supported = computed(() => current.value?.supported === true);
const changed = computed(
  () => supported.value && (speed.value !== current.value?.speed || acceleration.value !== current.value?.acceleration)
);

async function load() {
  busy.value = true;
  error.value = '';
  undo.value = null;
  try {
    current.value = await WyreMouseService.read();
    if (current.value.supported && current.value.speed !== null && current.value.acceleration !== null) {
      speed.value = current.value.speed;
      acceleration.value = current.value.acceleration;
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
    LoggerService.warn('system-settings', 'pointer_settings_read_failed', { error: cause });
  } finally {
    busy.value = false;
  }
}

async function apply() {
  if (!current.value || !changed.value || busy.value) return;
  const previous = current.value;
  busy.value = true;
  pending.value = false;
  error.value = '';
  notice.value = '';
  try {
    current.value = await WyreMouseService.apply({
      supported: true,
      speed: speed.value,
      acceleration: acceleration.value,
      accelerationProfile: null,
      reason: null,
    });
    undo.value = previous;
    speed.value = current.value.speed ?? speed.value;
    acceleration.value = current.value.acceleration ?? acceleration.value;
    notice.value = t('wyre.mouseApplied');
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
    LoggerService.warn('system-settings', 'pointer_settings_apply_failed', { error: cause });
  } finally {
    busy.value = false;
  }
}

async function restore() {
  if (!undo.value || busy.value) return;
  busy.value = true;
  error.value = '';
  notice.value = '';
  try {
    current.value = await WyreMouseService.apply(undo.value);
    speed.value = current.value.speed ?? speed.value;
    acceleration.value = current.value.acceleration ?? acceleration.value;
    undo.value = null;
    notice.value = t('wyre.mouseRestored');
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
    LoggerService.warn('system-settings', 'pointer_settings_restore_failed', { error: cause });
  } finally {
    busy.value = false;
  }
}

onMounted(() => void load());
</script>

<template>
  <MdPageShell :title="t('wyre.mouseTitle')" :subtitle="t('wyre.mouseDescription')" content-mode="workspace">
    <div class="grid h-full content-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,.65fr)]">
      <section class="rounded-xl border bg-card p-5 sm:p-7">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 class="m-0 text-base font-medium text-foreground">{{ t('wyre.pointerSpeed') }}</h2>
            <p class="mt-1 mb-0 text-sm text-muted-foreground">{{ t('wyre.pointerSpeedDescription') }}</p>
          </div>
          <output class="rounded-md border px-3 py-1.5 font-mono text-sm text-foreground" for="pointer-speed">{{ speed }}/20</output>
        </div>
        <input
          id="pointer-speed"
          v-model.number="speed"
          class="mt-6 w-full accent-primary"
          type="range"
          min="1"
          max="20"
          step="1"
          :disabled="!supported || busy"
          :aria-label="t('wyre.pointerSpeed')"
        >
        <div class="mt-6 flex items-center justify-between gap-6 border-t pt-5">
          <div>
            <label for="pointer-acceleration" class="text-sm font-medium text-foreground">{{ t('wyre.pointerAcceleration') }}</label>
            <p class="mt-1 mb-0 text-sm text-muted-foreground">{{ t('wyre.pointerAccelerationDescription') }}</p>
          </div>
          <input
            id="pointer-acceleration"
            v-model="acceleration"
            type="checkbox"
            role="switch"
            class="size-5 accent-primary"
            :disabled="!supported || busy"
          >
        </div>
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <Button :disabled="!changed || busy" @click="pending = true">{{ t('wyre.reviewMouseChanges') }}</Button>
          <Button v-if="undo" variant="outline" :disabled="busy" @click="restore">{{ t('wyre.undoMouseChanges') }}</Button>
        </div>
        <p v-if="notice" class="mb-0 mt-4 text-sm text-primary-text" role="status">{{ notice }}</p>
        <p v-if="error" class="mb-0 mt-4 text-sm text-destructive-text" role="alert">{{ error }}</p>
      </section>
      <aside class="rounded-xl border bg-card p-5 sm:p-7">
        <h2 class="mt-0 text-base font-medium text-foreground">{{ t('wyre.mouseAvailabilityTitle') }}</h2>
        <p class="mb-0 text-sm leading-relaxed text-muted-foreground">
          {{ supported ? t('wyre.mouseAvailability') : current?.reason ?? t('wyre.mouseLoading') }}
        </p>
        <Button class="mt-5" variant="outline" :disabled="busy" @click="load">{{ t('common.retry') }}</Button>
      </aside>
    </div>
    <Dialog v-model:open="pending">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ t('wyre.mouseReviewTitle') }}</DialogTitle>
          <DialogDescription>
            {{ t('wyre.mouseReviewDescription', { speed, acceleration: acceleration ? t('wyre.accelerationEnabled') : t('wyre.accelerationDisabled') }) }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" :disabled="busy" @click="pending = false">{{ t('common.cancel') }}</Button>
          <Button :disabled="busy" @click="apply">{{ t('wyre.confirmMouseChanges') }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </MdPageShell>
</template>
