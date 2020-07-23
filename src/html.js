import React from "react"

const getComponentsURL = () =>
  process.env.GATSBY_ROCHE_COMPONENTS_LIBRARY_URL ||
  "http://localhost:3334/roche-component-library"

export default class HTML extends React.Component {
  render() {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          {this.props.headComponents}
          {/** src matches stencil component library's development server /dist */}
          <script
            type="module"
            src={`${getComponentsURL()}/roche-component-library/roche-component-library.esm.js`}
          ></script>
          <script
            noModule
            src={`${getComponentsURL()}/roche-component-library/roche-component-library.js`}
          ></script>
        </head>
        <body>
          <div
            id="___gatsby"
            dangerouslySetInnerHTML={{ __html: this.props.body }}
          />
          {this.props.postBodyComponents}
        </body>
      </html>
    )
  }
}
