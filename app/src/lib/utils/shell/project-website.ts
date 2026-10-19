import { PROJECT_LINKS } from '@/lib/models/shell/application-shell';

/** Opens Wyre's own repository and contributor docs. */
export function projectWebsiteUrl(_language: string, path = ''): string {
  return path ? `${PROJECT_LINKS.repository}/blob/main/app/README.md#ai-providers` : PROJECT_LINKS.website;
}
