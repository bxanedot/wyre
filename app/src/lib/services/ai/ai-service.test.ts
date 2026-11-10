import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AiDelta } from '@/lib/models/ai/ai';
import { AiService, AiSession } from '@/lib/services/ai/ai-service';

const ipc = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('@tauri-apps/api/core', () => ({
  invoke: ipc.invoke,
  isTauri: () => false,
  Channel: class {
    onmessage: ((delta: AiDelta) => void) | null = null;
  },
}));

beforeEach(() => {
  vi.restoreAllMocks();
  ipc.invoke.mockReset();
});

describe('AI IPC sessions', () => {
  it('sends custom-provider requests without client metadata', async () => {
    ipc.invoke.mockImplementation(async command => (command === 'ai_begin' ? 'operation' : {}));
    await new AiSession().run(null, 'fr-FR', vi.fn());
    const args = ipc.invoke.mock.calls.find(call => call[0] === 'ai_explain')![1];
    expect(args).toMatchObject({
      id: 'operation',
      request: { context: null, language: 'fr-FR' },
      expectedMode: 'custom',
    });
    expect(args).not.toHaveProperty('metadata');
  });

  it('reserves an ID before streaming and delivers deltas', async () => {
    ipc.invoke.mockImplementation(async (command, args) => {
      if (command === 'ai_begin') return 'operation';
      if (command === 'ai_explain') {
        args.onDelta.onmessage({ kind: 'reasoning', text: 'first' });
        args.onDelta.onmessage({ kind: 'text', text: 'second' });
        return { promptTokens: 3, completionTokens: 4 };
      }
    });
    const onDelta = vi.fn();
    await expect(new AiSession().run(null, 'en-US', onDelta)).resolves.toEqual({
      promptTokens: 3,
      completionTokens: 4,
    });
    expect(onDelta.mock.calls).toEqual([[{ kind: 'reasoning', text: 'first' }], [{ kind: 'text', text: 'second' }]]);
    expect(ipc.invoke).toHaveBeenLastCalledWith('ai_cancel', { id: 'operation' });
  });

  it('cancels before reservation completes without dispatching a paid request', async () => {
    let resolve!: (id: string) => void;
    ipc.invoke.mockImplementation(command =>
      command === 'ai_begin'
        ? new Promise<string>(r => {
            resolve = r;
          })
        : Promise.resolve()
    );
    const session = new AiSession();
    const pending = session.run(null, 'en-US', vi.fn());
    const assertion = expect(pending).rejects.toBe('cancelled');
    await session.cancel();
    resolve('reserved');
    await assertion;
    expect(ipc.invoke.mock.calls.some(call => call[0] === 'ai_explain')).toBe(false);
  });

  it('separates public settings from the secret-bearing editor configuration', async () => {
    ipc.invoke.mockResolvedValue(null);
    await AiService.settings();
    expect(ipc.invoke).toHaveBeenCalledWith('ai_get_settings');
    const state = { configuration: null };
    ipc.invoke.mockResolvedValue(state);
    expect(await AiService.editorState()).toEqual(state);
    expect(ipc.invoke).toHaveBeenLastCalledWith('ai_get_configuration');
    await AiService.configuration();
    expect(ipc.invoke).toHaveBeenLastCalledWith('ai_get_configuration');
  });

  it('lists locally installed AI models through the dedicated IPC command', async () => {
    const fixtures = [{ provider: 'ollama', name: 'llama3', tag: 'latest', installedBytes: 4096 }];
    ipc.invoke.mockResolvedValue(fixtures);
    await expect(AiService.listLocalModels()).resolves.toEqual(fixtures);
    expect(ipc.invoke).toHaveBeenLastCalledWith('ai_list_local_models');
  });
});

it('uses a separate versioned preference contract without touching provider configuration', async () => {
  ipc.invoke.mockResolvedValue({ schemaVersion: 1, enabled: false });
  expect(await AiService.preferences()).toEqual({ schemaVersion: 1, enabled: false });
  expect(ipc.invoke).toHaveBeenLastCalledWith('ai_get_preferences');
  expect(await AiService.setEnabled(false)).toEqual({ schemaVersion: 1, enabled: false });
  expect(ipc.invoke).toHaveBeenLastCalledWith('ai_set_enabled', { enabled: false });
});
