import { describe, expect, it } from 'vitest';
import { projectWebsiteUrl } from '@/lib/utils/shell/project-website';

describe('project website links', () => {
  it.each([
    ['zh-CN', '/zh'],
    ['zh-TW', '/tw'],
    ['ja-JP', '/ja'],
    ['ko-KR', ''],
    ['ru-RU', ''],
    ['en-US', ''],
    ['tr-TR', ''],
    ['pt-BR', ''],
    ['unknown', ''],
  ])('maps %s to Wyre pages without query parameters', (locale) => {
    expect(projectWebsiteUrl(locale)).toBe('https://github.com/bxanedot/wyre');
    expect(projectWebsiteUrl(locale, '/docs/ai#custom-service')).toBe(
      'https://github.com/bxanedot/wyre/blob/main/app/README.md#ai-providers'
    );
  });
});
