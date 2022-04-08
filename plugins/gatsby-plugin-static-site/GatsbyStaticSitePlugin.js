const pluginName = 'GatsbyStaticSitePlugin';
const ConstDependency = require('webpack/lib/dependencies/ConstDependency');

module.exports = class GatsbyStaticSitePlugin {
  // eslint-disable-next-line class-methods-use-this
  apply(compiler) {
    compiler.hooks.compilation.tap(
      pluginName,
      (compilation, { normalModuleFactory }) => {
        compilation.dependencyTemplates.set(
          ConstDependency,
          new ConstDependency.Template(),
        );

        normalModuleFactory.hooks.parser
          .for('javascript/auto')
          .tap(pluginName, (parser) => {
            parser.hooks.importSpecifier.tap(
              pluginName,
              // eslint-disable-next-line consistent-return
              (statement, source, id, name) => {
                if (
                  (source === '@reach/router'
                    || source === '@gatsbyjs/reach-router')
                  && id === 'navigate'
                ) {
                  // remove navigate from import
                  parser.scope.definitions.delete(name);

                  // Add our own navigation function to gatsby
                  parser.state.current.addDependency(
                    new ConstDependency(
                      `function ${name}(url, options) {
                  // when we do not replace the current url or the replacement is just adding a slash we navigate
                  // this fixes canonical redirects
                  if (!options.replace || window.location.href + '/' === url) {
                    window.location = url;
                  }
                };`,
                      0,
                    ),
                  );
                  return true;
                }
              },
            );
          });
      },
    );
  }
};
