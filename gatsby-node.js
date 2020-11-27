const googleTagManagerId = process.env.ROCHE_GOOGLE_TAG_MANAGER_ID;
const { resolve } = require('path');
const { mkdirSync, writeFileSync } = require('fs');

const { NavigationService } = require('./node-services/dist/node-services/index');

const graphQuery = `
  {
    stories: allStoryblokEntry {
      edges {
        node {
          id
          name
          created_at
          uuid
          slug
          field_component
          full_slug
          content
          is_startpage
          parent_id
          group_id
          lang
          position
          tag_list
        }
      }
    }
  }
`;

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
  const { node } = val;
  if (node) {
    const langFromSlug = node.full_slug
      .split('/')
      .filter((el) => el !== '');

    if (langFromSlug[0] !== node.lang) {
      langFromSlug.unshift(node.lang);
    }

    return {
      ...acc,
      [langFromSlug[0]]: [...(acc[langFromSlug[0]] || []), { ...node }],
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
];

const cleanObject = (data, keys = mandatoryNavKeys) => {
  // Remove unnecessary info
  if (!(data instanceof Array)) {
    Object.keys(data).filter((key) => keys.indexOf(key) < 0).forEach((key) => {
      // eslint-disable-next-line no-param-reassign
      delete data[key];
    });
  }

  // Parse content to remove unnecessary info
  if (data.page && typeof data.page.content === 'string') {
    // eslint-disable-next-line no-param-reassign
    data.page.content = JSON.stringify(
      cleanObject(JSON.parse(data.page.content), mandatoryContentKeys),
    );
  }

  Object.keys(data).filter((key) => ignoreKeys.indexOf(key) < 0).forEach((prop) => {
    if (data[prop] && typeof data[prop] === 'object') {
      cleanObject(data[prop]);
    }
  });

  return data;
};

exports.createPages = async ({ graphql, actions: { createPage } }) => {
  const { errors, data } = await graphql(graphQuery);

  if (errors) {
    // eslint-disable-next-line no-console
    console.error('ERROR: GraphQL call not successful.\n', errors);
    throw new Error(errors);
  }

  if (!Array.isArray(data.stories.edges)) {
    throw new Error('ERROR: GraphQL call has no data.');
  }

  const template = resolve('./src/template.tsx');

  const navigationReadyStories = ParseStoriesForNavigation(data.stories.edges);
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

  data.stories.edges.forEach((entry) => {
    const path = entry.node.full_slug.includes('home')
      ? entry.node.full_slug.replace('home', '')
      : entry.node.full_slug;

    createPage({
      path: !path || path.substr(-1) !== '/' ? `${path || ''}/` : path,
      component: template,
      context: {
        googleTagManagerId,
        story: entry.node,
        footer: navigationReadyStories[entry.node.lang].find(((story) => story.slug === 'footer')),
        onClickNotice: navigationReadyStories[entry.node.lang].find(((story) => story.slug === 'on-click-notice')),
        search: navigationReadyStories[entry.node.lang].find(((story) => story.slug === 'search')),
      },
    });
  });
};
