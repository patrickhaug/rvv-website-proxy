import { IPluginRefObject } from 'gatsby';
import config from '../../../gatsby-config';

export interface GlobalContent {
  article: {
    sidebar: {
      firstVisitBox: {
        headline: string;
        target: string;
        text: string;
      };
      blogBox: {
        headline: string;
        linkTarget: string;
        linkText: string;
        image: string;
        text: string;
      };
    };
  };
  countryNames: {
    // index being the country code, e.g. "at", "it"
    [index: string]: string;
  };
  countryConfigs: {
    // index being the country code, e.g. "at", "it"
    [index: string]: {
      // available locales separated by ','
      locales: string;
      // slug the user is redirected to when switching country
      defaultSlug: string;
    };
  };
  countrySwitchModal: {
    headline: string;
    introText: string;
    imageSrc: string;
  };
  languages: {
    // index being the language code, e.g. "de", "en"
    [index: string]: string;
  };
}

const deepen = (obj): {[key: string]: string} => {
  const result = {};
  Object.keys(obj).forEach((key) => {
    const parts = key.split('.');
    let target = result;
    while (parts.length > 1) {
      const part = parts.shift();
      target[part] = target[part] || {};
      target = target[part] || {};
    }
    target[parts[0]] = obj[key];
  });

  return result;
};

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
      .find((item) => item.resolve === 'gatsby-source-graphql') || {} as IPluginRefObject;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getObject(): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { storyblok } = window as any;
    return storyblok || undefined;
  },

  parseDatasourceEntries(datasourceEntries): GlobalContent {
    const datasourceValues = datasourceEntries.datasource_entries.reduce((object, item) => ({
      ...object,
      [item.name]: item.value,
    }), {} as {[key: string]: string});
    return deepen(datasourceValues) as unknown as GlobalContent;
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
