const googleTagManagerId = process.env.ROCHE_GOOGLE_TAG_MANAGER_ID;
const { resolve } = require('path');
const { mkdirSync, writeFileSync } = require('fs');

const { NavigationService, StoryblokService } = require('./node-services/dist/node-services/index');

const queryPrepareContentFetch = `
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
`;

const queryContent = (
  page = 1,
  perPage = 100,
  language,
  resolveRelations = StoryblokService.getConfig().options.resolveRelations,
) => {
  const queryLang = language ? `starts_with: "${language}/*",` : '';
  const queryResolveRelations = resolveRelations ? `resolve_relations: "${resolveRelations}",` : '';

  return `
    {
      storyblok {
        ContentNodes(page: ${page}, per_page: ${perPage}, ${queryResolveRelations} ${queryLang}) {
          items {
            id
            name
            created_at
            uuid
            slug
            full_slug
            is_startpage
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
};

/**
 * Returns stories, divided by language, ready to be consumed by Navigation Service
 * {
 *  default: [all default stories],
 *  lang1: [all lang1 stories],
 *  lang2: [all lang2 stories],
 *  etc
 * }
 */
const ParseStoriesForNavigation = (array) => array.reduce((acc, val) => {
  if (val) {
    const langFromSlug = val.full_slug
      .split('/')
      .filter((el) => el !== '');

    if (langFromSlug[0] !== val.lang) {
      langFromSlug.unshift(val.lang);
    }

    return {
      ...acc,
      [langFromSlug[0]]: [...(acc[langFromSlug[0]] || []), { ...val }],
    };
  }
  return acc;
}, {});

const mandatoryNavKeys = [
  // item attributes
  'id',
  'uuid',
  'real_path',
  'parent_id',
  'is_folder',
  'is_startpage',
  'children',
  'breadcrumbs',
  'page',
  // page attributes
  'name',
  'content',
  // breadcrumbs attributes
  'href',
  'label',
];

const mandatoryContentKeys = [
  'navigation_title',
  'navigation_subline',
  'highlights',
];

const ignoreKeys = [
  'highlights',
  'page',
  'content',
];

const cleanObject = (data, keys = mandatoryNavKeys) => {
  // Remove unnecessary info
  if (!(data instanceof Array)) {
    Object.keys(data)
      .filter((key) => keys.indexOf(key) < 0)
      .forEach((key) => {
        // eslint-disable-next-line no-param-reassign
        delete data[key];
      });
  }

  // Parse content to remove unnecessary info
  if (data.page && typeof data.page.content !== 'undefined') {
    // eslint-disable-next-line no-param-reassign
    data.page.content = cleanObject(data.page.content, mandatoryContentKeys);
  }

  Object.keys(data)
    .filter((key) => ignoreKeys.indexOf(key) < 0)
    .forEach((prop) => {
      if (data[prop] && typeof data[prop] === 'object') {
        cleanObject(data[prop]);
      }
    });

  return data;
};

const createQuery = (
  graphql,
  container,
  totalItems,
  itemsPerPage,
  language,
) => {
  const lastPage = Math.ceil((totalItems / itemsPerPage));
  const allPageQueries = Array.from({ length: lastPage }, (_, i) => i + 1);

  return allPageQueries.map((page) => async () => {
    const { errors, data } = await graphql(queryContent(page, itemsPerPage, language));

    if (errors) {
      throw new Error(errors);
    }

    if (!Array.isArray(data.storyblok.ContentNodes.items)) {
      throw new Error('ERROR: GraphQL call has no data.');
    }

    const { items } = data.storyblok.ContentNodes;
    container.push(...items);
  });
};

let localeList;

exports.createPages = async ({ graphql, actions: { createPage } }) => {
  const preContentFetch = await graphql(queryPrepareContentFetch);

  if (preContentFetch.errors) {
    // eslint-disable-next-line no-console
    console.error('ERROR: GraphQL call not successful.\n', preContentFetch.errors);
    throw new Error(preContentFetch.errors);
  }

  const { total } = preContentFetch.data.storyblok.ContentNodes;
  const { languageCodes } = preContentFetch.data.storyblok.Space;
  const itemsPerPage = 100;
  const allEntries = [];
  const allQueries = [
    ...languageCodes.flatMap((lang) => createQuery(graphql, allEntries, total, itemsPerPage, lang)),
    ...createQuery(graphql, allEntries, total, itemsPerPage),
  ];

  // eslint-disable-next-line compat/compat
  await Promise.all(allQueries.map((query) => query()));

  // To pass as context to 404 page.
  localeList = [...languageCodes];

  const navigationReadyStories = ParseStoriesForNavigation(allEntries);
  let navigationTreesByLanguage = {};

  /* eslint-disable guard-for-in, no-await-in-loop, no-restricted-syntax */
  for (const language in navigationReadyStories) {
    const tree = await NavigationService.getNavigation(navigationReadyStories[language], language);
    navigationTreesByLanguage = {
      ...navigationTreesByLanguage,
      [language]: cleanObject(JSON.parse(JSON.stringify(tree))),
    };
  }
  /* eslint-enable guard-for-in, no-await-in-loop, no-restricted-syntax */

  mkdirSync('public', { recursive: true });
  Object.keys(navigationTreesByLanguage).forEach((key) => {
    writeFileSync(`public/navigation-data-${key}.json`, JSON.stringify(navigationTreesByLanguage[key]));
  });

  const template = resolve('./src/templates/default.tsx');

  allEntries.forEach((entry) => {
    const path = entry.full_slug.includes('home')
      ? entry.full_slug.replace('home', '')
      : entry.full_slug;

    createPage({
      path: !path || path.substr(-1) !== '/' ? `${path || ''}/` : path,
      component: template,
      context: {
        googleTagManagerId,
        story: entry,
        footer: navigationReadyStories[entry.lang].find(((story) => story.slug === 'footer')),
        onClickNotice: navigationReadyStories[entry.lang].find(((story) => story.slug === 'on-click-notice')),
        search: navigationReadyStories[entry.lang].find(((story) => story.slug === 'search')),
      },
    });
  });
};

/**
 * Localized 404 page creation.
 * Refer to the readme for more info.
 */
exports.onCreatePage = async ({ page, actions }) => {
  if (page.internalComponentName === 'Component404Html') {
    const { deletePage, createPage } = actions;
    const master404Component = resolve('./src/templates/404.tsx');

    deletePage(page);

    createPage({
      component: master404Component,
      path: '/404.html',
      context: {
        localeList,
      },
    });
  }
};
// This is needed so that the build process does not fail because in gatby-config.js
// the fs module is not available and therefore it throws an error because dotenv has
// it as a dependency.
exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    node: {
      fs: 'empty',
    },
  });
};
