import { IPluginRefObject } from 'gatsby';
import config from '../../../gatsby-config';

const getUrlParams = (): Record<string, string | true> => window.location.search.substr(1)
  .split('&')
  .filter((slug) => !!slug)
  .reduce((accumulator, slug) => ({
    ...accumulator,
    ...(slug.split('=')[0] && {
      [slug.split('=')[0]]: slug.split('=')[1] || true,
    }),
  }), {});

export const StoryblokService = {
  getConfig(): IPluginRefObject {
    return (config.plugins as IPluginRefObject[])
      .find((item) => item.resolve === 'gatsby-source-storyblok') || {} as IPluginRefObject;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getObject(): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { storyblok } = window as any;
    return storyblok || undefined;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async redirect(callback?: (...args: any[]) => void): Promise<void> {
    // eslint-disable-next-line compat/compat
    return new Promise((resolve) => {
      const storyblok = StoryblokService.getObject();
      const params = getUrlParams();
      const isValidRedirect = typeof params.redirect === 'string';

      if (storyblok) {
        storyblok.get({ slug: isValidRedirect ? params.redirect as string : '/home' }, (...args) => {
          if (callback) {
            callback(...args);
          }
          resolve();
        });
      } else {
        window.location.href = isValidRedirect ? params.redirect as string : '/';
        resolve();
      }
    });
  },
};
