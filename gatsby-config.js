module.exports = {
  siteMetadata: {
    author: '@virtualidentityag',
    url: process.env.GATSBY_WEBSITE_URL || 'http://localhost:8000',
    siteUrl: process.env.GATSBY_WEBSITE_URL || 'http://localhost:8000',
    defaultLanguage: 'en',
  },
  plugins: [
    // Disable "editor" page if it's a public build
    ...(process.env.PUBLIC_BUILD ? [{
      resolve: 'gatsby-plugin-page-creator',
      options: {
        path: `${__dirname}/src/pages`,
        ignore: ['editor.(j|t)s?(x)'],
      },
    }] : []),
    {
      resolve: 'gatsby-source-storyblok',
      options: {
        accessToken: process.env.GATSBY_STORYBLOK_SPACE_API_KEY || '3987r2nQTnEcd6rppyOv3wtt',
        homeSlug: 'home',
        version: process.env.GATSBY_ENV === 'production' ? 'published' : 'draft',
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
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'gatsby-starter-default',
        short_name: 'starter',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: 'src/resources/images/favIcon.svg', // This path is relative to the root of the site.
      },
    },
    'gatsby-plugin-sitemap',
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    {
      resolve: 'gatsby-plugin-stencil',
      options: {
        // The module of your components (required), eg "@ionic/core".
        module: '@rocheglobal/component-library',

        // Stencil renderToString options (optional): https://stenciljs.com/docs/hydrate-app#configuration-options
        renderToStringOptions: {
          prettyHtml: true,
        },
      },
    },
  ],
};
