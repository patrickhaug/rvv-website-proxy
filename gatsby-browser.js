/**
 *
 * Context:
 * App consitently breaks on IE11, erratic behaviour for some components in Safari and FF.
 * Stencil's build time hydrate result is not the same as gatsby's page data.
 *
 * For the first client side render, ReactDOM render is called using gatsby's chunkmaps and data.
 * The result of stencil's hydrate function and gatsby's page-data clash.
 * Likely due to a racing condition.
 *
 * Fix:
 * If javascript is running, we clear the DOM from stencil's server hydrated results.
 * We then let gatsby take care of serving the content.
 *
 * For more details, please refer to:
 * https://www.gatsbyjs.com/docs/production-app/#first-load
 * https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/#onClientEntry
 *
 * Runtime order of relevant APIs is:
 * 1. onClientEntry (every page load)
 * 2. replaceHydrateFunction (ReactDom.render is called)
 * 3. onInitialClientRender (every page load)
 */
exports.onClientEntry = () => {
  document.getElementById('___gatsby').innerHTML = '';
};
