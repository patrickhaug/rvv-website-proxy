import React from 'react';

const getComponentsURL = (): string => process.env.GATSBY_COMPONENTS_LIBRARY_URL;

interface HTMLProps {
  body: string;
  headComponents: JSX.Element;
  postBodyComponents: JSX.Element;
}

// eslint-disable-next-line import/no-default-export
export default function HTML({ body, headComponents, postBodyComponents }: HTMLProps): JSX.Element {
  const src = `${getComponentsURL()}/rvv-component-library/rvv-component-library`;
  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {headComponents}
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="msapplication-navbutton-color" content="#FFFFFF" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#FFFFFF" />
        {/* Onetrust cookie consent */}
        {/* <script
          src="https://cdn.cookielaw.org/scripttemplates/otSDKStub.js"
          data-document-language="true"
          type="text/javascript"
          charSet="UTF-8"
          data-domain-script={process.env.GATSBY_ONETRUST_KEY}
          async
          defer
        ></script>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{ __html: 'function OptanonWrapper() {}' }}
          defer
        >
        </script> */}

        {/* Optimized stylesheet loading */}
        <link rel="preload" href={`${src}.css`} as="style" />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{ __html: `document.querySelectorAll('link[href="${src}.css"]').forEach(el => el.setAttribute('onload', 'this.onload=null;this.rel="stylesheet"'))` }}
          async
          defer
        ></script>
        <noscript><link rel="stylesheet" href={`${src}.css`} /></noscript>

        {/* Defered component library load */}
        <script type="module" src={`${src}.esm.js`} async defer></script>
        <script noModule src={`${src}.js`} async defer></script>
      </head>
      <body>
        <div id="global-modal"/>
        <div id="___gatsby" dangerouslySetInnerHTML={{ __html: body }} />
        {postBodyComponents}
      </body>
    </html>
  );
}
