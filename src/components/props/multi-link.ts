import { StringService } from '../../services';

export interface MultiLinkData {
  anchor: string;
  cached_url: string;
  id: string;
  linktype?: string;
  url?: string;
  fieldtype?: string;
}

const rootAlias = 'home';

export const multiLink = (key: string, data: MultiLinkData): Record<string, string> => {
  /* eslint-disable @typescript-eslint/camelcase */
  const { cached_url, anchor, url } = data;
  const parsedLink = url || `/${cached_url.replace(rootAlias, '')}${anchor ? `#${anchor}` : ''}`.replace('//', '/');
  /* eslint-enable @typescript-eslint/camelcase */
  return ({ [StringService.snakeToKebab(key)]: parsedLink });
};
