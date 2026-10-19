// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import enUS from '@/locales/en-US.json';
import { emptyReadings } from '@/lib/utils/system-resources/system-resources';
import { ResidentService } from '@/lib/services/resident/resident-service';
import { WyreNetworkService } from '@/lib/services/network/wyre-network-service';
import NetworkPage from './index.vue';

vi.mock('@/lib/services/resident/resident-service', () => ({
  ResidentService: { reading: vi.fn(), onReading: vi.fn() },
}));
vi.mock('@/lib/services/network/wyre-network-service', () => ({ WyreNetworkService: { measure: vi.fn() } }));
vi.mock('@/lib/services/settings/byte-size-service', () => ({
  ByteSizeService: { bytes: (bytes: number) => `${bytes} B` },
}));
vi.mock('@/lib/services/diagnostics/logger-service', () => ({ LoggerService: { warn: vi.fn() } }));

const reading = {
  revision: 1,
  ...emptyReadings(),
  network: {
    status: 'ready' as const,
    sampledAtMs: 1000,
    value: {
      cumulative: null,
      interface: {
        id: 'wifi0',
        name: 'Wi-Fi',
        kind: 'wifi' as const,
        connected: true,
        physical: true,
        defaultRouteMetric: 1,
        details: {
          addresses: ['192.168.1.42', 'fe80::1'],
          hardwareAddress: null,
          wifi: {
            standard: 'Wi-Fi 6',
            channel: 36,
            bandGhz: 5,
            channelWidthMhz: 80,
            signalDbm: -50,
            noiseDbm: -90,
          },
        },
      },
      receivedBytesPerSecond: 1024,
      transmittedBytesPerSecond: 512,
      receivedBytesSinceStart: 0,
      transmittedBytesSinceStart: 0,
      receiveLinkBps: 100_000_000,
      transmitLinkBps: 100_000_000,
      selectionReason: 'defaultRoute' as const,
    },
  },
};
const result = {
  latencyMs: 32,
  jitterMs: 4,
  downloadMbps: 128.5,
  uploadMbps: 24.3,
  failedProbesPercent: 0,
  dataMb: 16,
};
const wrappers: ReturnType<typeof mount>[] = [];

function render() {
  const wrapper = mount(NetworkPage, {
    global: {
      plugins: [
        createPinia(),
        createI18n({ legacy: false, missingWarn: false, fallbackWarn: false, messages: { en: enUS }, locale: 'en' }),
      ],
      stubs: {
        Button: { template: '<button v-bind="$attrs"><slot /></button>' },
        MdPageShell: { template: '<main><slot name="actions" /><slot /></main>' },
      },
    },
  });
  wrappers.push(wrapper);
  return wrapper;
}

describe('network page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ResidentService.reading).mockResolvedValue(reading);
    vi.mocked(ResidentService.onReading).mockResolvedValue(vi.fn());
  });

  afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

  it('shows the active interface, live rates, and the on-demand speed check', async () => {
    vi.mocked(WyreNetworkService.measure).mockResolvedValue(result);
    const wrapper = render();
    await flushPromises();

    expect(wrapper.text()).toContain('Wi-Fi');
    expect(wrapper.text()).toContain('Connected');
    expect(wrapper.text()).toContain('192.168.1.42');
    expect(wrapper.text()).toContain('1024 B/s');
    expect(wrapper.text()).toContain('512 B/s');

    await wrapper.get('button').trigger('click');
    await flushPromises();
    expect(WyreNetworkService.measure).toHaveBeenCalledOnce();
    expect(wrapper.text()).toContain('32 ms');
    expect(wrapper.find('dl').text()).toContain('128.5 Mbps');
  });

  it('shows a localized failure instead of raw transport details', async () => {
    vi.mocked(WyreNetworkService.measure).mockRejectedValue(new Error('raw request detail'));
    const wrapper = render();
    await wrapper.get('button').trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain(enUS.wyre.networkErrorDescription);
    expect(wrapper.text()).not.toContain('raw request detail');
  });
});
