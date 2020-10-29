module.exports = {
  siteMetadata: {
    title: 'Roche Website Starter',
    description: 'A boilerplate project for Roche websites.',
    author: '@virtualidentityag',
    url: 'https://live.roche-website-starter.roche-infra.com',
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
        version: process.env.NODE_ENV === 'production' ? 'published' : 'draft',
        resolveLinks: 'story',
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
        icon: 'src/resources/images/icon.png', // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
};
