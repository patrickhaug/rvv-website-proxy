import { StoryblokService } from '../storyblok';

const retry = <T>(
  fn: () => Promise<T>,
  delay: number,
  retries: number,
  conditionFn: (error) => boolean,
// eslint-disable-next-line compat/compat
): Promise<T> => new Promise((resolve) => {
  fn()
    .then((response) => {
      if (conditionFn(response) && retries > 0) {
        setTimeout(() => {
          resolve(retry(fn, delay, retries - 1, conditionFn));
        }, delay);
      } else {
        resolve(response);
      }
    });
});

// https://www.storyblok.com/docs/graphql-api#rate-limits
const is429Error = (resp): boolean => resp.errors?.[0]?.message?.includes('429');

export const BuildService = {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  getGlobalComponents: (stories: Record<string, any>) => {
    const globalComponents = stories.default.find(((story: any) => story?.content?.component === 'global-components'));

    if (!globalComponents || globalComponents.length <= 0) {
      throw new Error('Global components not defined. Please refer to https://roche-ds.atlassian.net/wiki/spaces/RWI21/pages/2113536007/Website+configuration for details');
    }

    if (globalComponents.length > 1) {
      throw new Error('More than 1 instance of global components is defined. Only 1 is allowed per space.');
    }

    return globalComponents;
  },
  /* eslint-enable @typescript-eslint/no-explicit-any */

  getGlobalComponent: (list: [], uuid: string): [] => list.find((({ uuid: id }) => id === uuid)),

  queryPrepareContentFetch: `
    {
      storyblok {
        ContentNodes(per_page: 1) {
          total
        }
        Space {
          languageCodes
        }
      }
    }
  `,

  queryContent: (
    page = 1,
    perPage = 25,
    language,
    resolveRelations = StoryblokService.getConfig().options.resolveRelations,
    resolveLinks = StoryblokService.getConfig().options.resolveLinks,
  ) => {
    const queryLang = language ? `starts_with: "${language}/*",` : '';
    const queryResolveRelations = resolveRelations
      ? `resolve_relations: "${resolveRelations}",`
      : '';
    const queryResolveLinks = resolveLinks
      ? `resolve_links: "${resolveLinks}",`
      : '';
    return `
      {
        storyblok {
          ContentNodes(page: ${page}, per_page: ${perPage}, ${queryResolveRelations} ${queryResolveLinks} ${queryLang}) {
            items {
              id
              name
              created_at
              uuid
              slug
              full_slug
              is_startpage
              alternates { fullSlug, id, isFolder, name, parentId, published, slug }
              parent_id
              group_id
              lang
              position
              tag_list
              content
            }
            total
          }
        }
      }
    `;
  },

  /*
   * Returns stories, divided by language, to facilitate consumption
   * {
   *  default: [all default stories],
   *  lang1: [all lang1 stories],
   *  lang2: [all lang2 stories],
   *  etc
   * }
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseStoriesByLanguage: (array: any[]) => array.reduce((acc, val) => {
    if (val) {
      const langFromSlug = val.full_slug
        .split('/')
        .filter((el: string) => el !== '');

      if (langFromSlug[0] !== val.lang) {
        langFromSlug.unshift(val.lang);
      }

      return {
        ...acc,
        [langFromSlug[0]]: [...(acc[langFromSlug[0]] || []), { ...val }],
      };
    }
    return acc;
  }, {}),

  createQuery: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphql: (query: string) => Promise<any>,
    container: [],
    totalItems: number,
    itemsPerPage: number,
    language: string,
  ) => {
    const lastPage = Math.ceil((totalItems / itemsPerPage));
    const allPageQueries = Array.from({ length: lastPage }, (_, i) => i + 1);

    return allPageQueries.map((page) => async () => {
      const {
        data,
        errors,
      } = await retry(() => graphql(BuildService.queryContent(page, itemsPerPage, language)),
        1000,
        10,
        is429Error);

      if (errors) {
        throw new Error(errors);
      }

      if (!Array.isArray(data.storyblok.ContentNodes.items)) {
        throw new Error('ERROR: GraphQL call has no data.');
      }

      const { items } = data.storyblok.ContentNodes;
      container.push(...(items as never[]));
    });
  },
  /* Protects client only routes from matching slugs being created in Storyblok */
  clientOnlyPaths: ['/fund-dynamic'],

  isClientOnlyPath(path: string): boolean {
    return (
      this.clientOnlyPaths.some(
        (clientOnlyPath) => `/${path}`.replace('//', '/').includes(clientOnlyPath),
      )
    );
  },

  shouldSkipPageBuild(path: string): boolean {
    if (path.includes('[slug]') || path.endsWith('/')) {
      return false;
    }

    return this.isClientOnlyPath(path);
  },
};
