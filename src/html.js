import React from "react"

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
            src="http://localhost:3334/roche-component-library/roche-component-library.esm.js"
          ></script>
          <script
            noModule
            src="http://localhost:3334/roche-component-library/roche-component-library.js"
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
