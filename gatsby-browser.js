const { BrowserDetectionService } = require('./node-services/dist/node-services/index');

/**
 * TODO: Remove custom onClientEntry once we no longer support IE11
 *
 * Context:
 * On IE11, app breaks when serving server side hydrated stencil components.
 *
 * For the first client side render, ReactDOM render is called using gatsby's chunkmaps and data.
 * The result of stencil's hydrate function and gatsby's page-data clash.
 *
 * Fix:
 * When client is IE11, we clear the dom from stencil's server hydrated results.
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
  if (BrowserDetectionService.isIE11()) {
    document.getElementById('___gatsby').innerHTML = '';
  }
};
