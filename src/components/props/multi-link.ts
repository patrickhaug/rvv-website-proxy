import { StringService } from '../../services';

export interface MultiLinkData {
  anchor: string;
  cached_url: string;
  id: string;
  linktype?: string;
  url?: string;
  fieldtype?: string;
  story: {
    full_slug: string;
  };
}

const rootAlias = 'home';

export const multiLink = (
  key: string,
  data: MultiLinkData,
): Record<string, string> => {
  const {
    cached_url, anchor, url, story,
  } = data;
  const { full_slug } = story || { full_slug: null };

  const parsedLink = url
    || `/${
      full_slug
        ? full_slug.replace(rootAlias, '')
        : cached_url.replace(rootAlias, '')
    }${anchor ? `#${anchor}` : ''}`.replace('//', '/');

  return { [StringService.snakeToKebab(key)]: parsedLink };
};
