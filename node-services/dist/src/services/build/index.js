"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildService = void 0;
const storyblok_1 = require("../storyblok");
const retry = (fn, delay, retries, conditionFn) => new Promise((resolve) => {
    fn()
        .then((response) => {
        if (conditionFn(response) && retries > 0) {
            setTimeout(() => {
                resolve(retry(fn, delay, retries - 1, conditionFn));
            }, delay);
        }
        else {
            resolve(response);
        }
    });
});
// https://www.storyblok.com/docs/graphql-api#rate-limits
const is429Error = (resp) => { var _a, _b, _c; return (_c = (_b = (_a = resp.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.includes('429'); };
exports.BuildService = {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    getGlobalComponents: (stories) => {
        const globalComponents = stories.default.find(((story) => { var _a; return ((_a = story === null || story === void 0 ? void 0 : story.content) === null || _a === void 0 ? void 0 : _a.component) === 'global-components'; }));
        if (!globalComponents || globalComponents.length <= 0) {
            throw new Error('Global components not defined. Please refer to https://roche-ds.atlassian.net/wiki/spaces/RWI21/pages/2113536007/Website+configuration for details');
        }
        if (globalComponents.length > 1) {
            throw new Error('More than 1 instance of global components is defined. Only 1 is allowed per space.');
        }
        return globalComponents;
    },
    /* eslint-enable @typescript-eslint/no-explicit-any */
    getGlobalComponent: (list, uuid) => list.find((({ uuid: id }) => id === uuid)),
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
    queryContent: (page = 1, perPage = 25, language, resolveRelations = storyblok_1.StoryblokService.getConfig().options.resolveRelations, resolveLinks = storyblok_1.StoryblokService.getConfig().options.resolveLinks) => {
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
    parseStoriesByLanguage: (array) => array.reduce((acc, val) => {
        if (val) {
            const langFromSlug = val.full_slug
                .split('/')
                .filter((el) => el !== '');
            if (langFromSlug[0] !== val.lang) {
                langFromSlug.unshift(val.lang);
            }
            return Object.assign(Object.assign({}, acc), { [langFromSlug[0]]: [...(acc[langFromSlug[0]] || []), Object.assign({}, val)] });
        }
        return acc;
    }, {}),
    createQuery: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphql, container, totalItems, itemsPerPage, language) => {
        const lastPage = Math.ceil((totalItems / itemsPerPage));
        const allPageQueries = Array.from({ length: lastPage }, (_, i) => i + 1);
        return allPageQueries.map((page) => async () => {
            const { data, errors, } = await retry(() => graphql(exports.BuildService.queryContent(page, itemsPerPage, language)), 1000, 10, is429Error);
            if (errors) {
                throw new Error(errors);
            }
            if (!Array.isArray(data.storyblok.ContentNodes.items)) {
                throw new Error('ERROR: GraphQL call has no data.');
            }
            const { items } = data.storyblok.ContentNodes;
            container.push(...items);
        });
    },
    /* Protects client only routes from matching slugs being created in Storyblok */
    clientOnlyPaths: ['/fund-dynamic'],
    isClientOnlyPath(path) {
        return (this.clientOnlyPaths.some((clientOnlyPath) => `/${path}`.replace('//', '/').includes(clientOnlyPath)));
    },
    shouldSkipPageBuild(path) {
        if (path.includes('[slug]') || path.endsWith('/')) {
            return false;
        }
        return this.isClientOnlyPath(path);
    },
};
