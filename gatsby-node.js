const { resolve } = require('path');

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
        }
      }
    }
  }
`;

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
  const entries = data.stories.edges;
  const contents = entries.filter((entry) => entry.node.field_component !== 'navigation');

  contents.forEach((entry) => {
    const navigation = entries.filter(({ node }) => (
      node.field_component === 'navigation' && node.lang === entry.node.lang
    ));

    if (!navigation.length) {
      throw new Error('The global navigation item has not been found. Please create a content item with the content type navigation in Storyblok.');
    }

    createPage({
      path: entry.node.full_slug && entry.node.full_slug !== 'home'
        ? `/${entry.node.full_slug}/`
        : '/',
      component: template,
      context: {
        navigation: navigation[0].node,
        story: entry.node,
      },
    });
  });
};
