const activeEnv = process.env.WEBSITE_STAGE || 'local';

require('dotenv').config({
  path: `./configuration/.env.${activeEnv}`,
});

/**
 * List all components, that should be resolved automatically with gatsby source graphql.
 * Format: {componentName}.{key}
 * With key beeing the field, that is a linked story ressource via options, or multioptions in
 * in the defined component.
 */
const autoResolveField = [
  'rvv-editorial-big-feature.article',
  'editorial-item.page',
  'article.category',
  'rvv-disclaimer.disclaimers',
];

module.exports = {
  siteMetadata: {
    author: '@virtualidentityag',
    url: process.env.GATSBY_WEBSITE_URL,
    siteUrl: process.env.GATSBY_WEBSITE_URL,
    defaultLanguage: 'en',
    twitterHandle: process.env.GATSBY_TWITTER_HANDLE,
  },
  plugins: [
    // Disable "editor" page if it's a public build
    // remove live condition if you want to test fund detail pages locally
    ...(process.env.GATSBY_ENV === 'live'
      ? [
        {
          resolve: 'gatsby-plugin-page-creator',
          options: {
            path: `${__dirname}/src/pages/fund-dynamic`,
            ignore: ['editor.(j|t)s?(x)'],
          },
        },
      ]
      : []),
    {
      resolve: 'gatsby-source-graphql',
      options: {
        accessToken: process.env.GATSBY_STORYBLOK_SPACE_API_KEY,
        typeName: 'Storyblok',
        fieldName: 'storyblok',
        url: 'https://gapi.storyblok.com/v1/api',
        headers: {
          Token: `${process.env.GATSBY_STORYBLOK_SPACE_API_KEY}`,
          Version: `${
            process.env.GATSBY_ENV === 'live' ? 'published' : 'draft'
          }`,
        },
        resolveRelations: autoResolveField.join(','),
        resolveLinks: 'url',
      },
    },
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/resources/images`,
      },
    },
    {
      resolve: 'gatsby-plugin-react-helmet-canonical-urls',
      options: {
        siteUrl: process.env.GATSBY_WEBSITE_URL,
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'gatsby-starter-default',
        short_name: 'starter',
        start_url: '/',
        background_color: '#fff',
        theme_color: '#fff',
        display: 'minimal-ui',
        icon: 'src/resources/images/favicon.jpeg', // This path is relative to the root of the site.
      },
    },
    {
      resolve: 'gatsby-plugin-sitemap',
      options: {
        serialize: ({ path, modifiedGmt }) => ({
          url: path,
          lastmod: modifiedGmt,
        }),
      },
    },
    {
      resolve: 'gatsby-plugin-stencil',
      options: {
        // The module of your components (required), eg "@ionic/core".
        module: process.env.GATSBY_COMPONENTS_LIBRARY_HYDRATE_URL,
        // Stencil renderToString options (optional): https://stenciljs.com/docs/hydrate-app#configuration-options
        renderToStringOptions: {
          clientHydrateAnnotations: false,
          removeHtmlComments: true,
          // Parse the hydrated document and optimize for performance
          afterHydrate: (document) => {
            document
              .querySelectorAll('style, rvv-offcanvas')
              .forEach((tag) => tag.parentElement.removeChild(tag));

            const stylesForHydratedContent = document.createElement('style');
            stylesForHydratedContent.type = 'text/css';
            stylesForHydratedContent.id = 'styles-for-load-time-only';
            stylesForHydratedContent.innerHTML = '.hydrated {display: none;}';
            document.head.appendChild(stylesForHydratedContent);
          },
        },
      },
    },
    {
      resolve: 'gatsby-plugin-s3',
      options: {
        bucketName: process.env.GATSBY_AWS_S3_BUCKET || 'no-bucket',
        region: 'eu-central-1',
        generateRoutingRules: false,
        acl: null,
      },
    },
    // 'gatsby-plugin-static-site',
  ],
};
