import { Channel, invoke } from '@tauri-apps/api/core';
import type {
  AiConfiguration,
  AiConfigurationUpdate,
  AiDelta,
  AiContext,
  AiSettings,
  AiUsage,
  AiServiceMode,
  AiEditorState,
  AiPreferences,
  InstalledLocalModel,
} from '@/lib/models/ai/ai';
import { LoggerService } from '@/lib/services/diagnostics/logger-service';

/** One owned IPC session; closing a dialog cancels its request, not another module's work. */
export class AiSession {
  private cancelled = false;
  private id: string | null = null;

  async run(
    context: AiContext | null,
    language: string,
    onDelta: (delta: AiDelta) => void,
    mode: AiServiceMode = 'custom'
  ): Promise<AiUsage> {
    this.id = await invoke<string>('ai_begin');
    try {
      if (this.cancelled) throw 'cancelled';
      const onDeltaChannel = new Channel<AiDelta>();
      onDeltaChannel.onmessage = text => {
        if (!this.cancelled) onDelta(text);
      };
      const result = await invoke<AiUsage>('ai_explain', {
        id: this.id,
        request: { context, language },
        expectedMode: mode,
        onDelta: onDeltaChannel,
      });
      if (this.cancelled) throw 'cancelled';
      return result;
    } finally {
      try {
        await this.cancel();
      } catch {
        LoggerService.warn('ai', 'request_release_failed');
      }
    }
  }

  async cancel(): Promise<void> {
    this.cancelled = true;
    if (this.id !== null) await invoke<void>('ai_cancel', { id: this.id });
  }
}

export class AiService {
  static preferences(): Promise<AiPreferences> {
    return invoke('ai_get_preferences');
  }
  static setEnabled(enabled: boolean): Promise<AiPreferences> {
    return invoke('ai_set_enabled', { enabled });
  }
  static editorState(): Promise<AiEditorState> {
    return invoke('ai_get_configuration');
  }
  static async configuration(): Promise<AiConfiguration | null> {
    return (await this.editorState()).configuration;
  }
  static settings(): Promise<AiSettings | null> {
    return invoke('ai_get_settings');
  }
  static save(update: AiConfigurationUpdate): Promise<AiSettings> {
    return invoke('ai_save_settings', { update });
  }
  static delete(): Promise<void> {
    return invoke('ai_delete_settings');
  }

  /** Enumerates locally installed AI models (e.g. Ollama repositories). */
  static listLocalModels(): Promise<InstalledLocalModel[]> {
    return invoke('ai_list_local_models');
  }
}
