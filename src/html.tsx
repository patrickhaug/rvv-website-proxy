import React from 'react';

const getComponentsURL = (): string => process.env.ROCHE_COMPONENTS_LIBRARY_URL
  || 'http://localhost:3334/dist';

interface HTMLProps {
  body: string;
  headComponents: JSX.Element;
  postBodyComponents: JSX.Element;
}

// eslint-disable-next-line import/no-default-export
export default function HTML({ body, headComponents, postBodyComponents }: HTMLProps): JSX.Element {
  const srcScript = `${getComponentsURL()}/roche-component-library/roche-component-library.esm.js`;
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {headComponents}
        {/** src matches stencil component library's development server /dist */}
        <script type="module" src={srcScript}></script>
        <script noModule src={srcScript.replace('.esm.js', '.js')}></script>
      </head>
      <body>
        <div id="___gatsby" dangerouslySetInnerHTML={{ __html: body }} />
        {postBodyComponents}
      </body>
    </html>
  );
}
