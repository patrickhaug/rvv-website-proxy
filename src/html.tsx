import React from 'react';
import { RecaptchaService } from './services';

const getComponentsURL = (): string => process.env.GATSBY_ROCHE_COMPONENTS_LIBRARY_URL;

interface HTMLProps {
  body: string;
  headComponents: JSX.Element;
  postBodyComponents: JSX.Element;
}

// eslint-disable-next-line import/no-default-export
export default function HTML({ body, headComponents, postBodyComponents }: HTMLProps): JSX.Element {
  const src = `${getComponentsURL()}/roche-component-library/roche-component-library`;
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Onetrust should always be the first script */}
        <script
          src="https://cdn.cookielaw.org/scripttemplates/otSDKStub.js"
          data-document-language="true"
          type="text/javascript"
          charSet="UTF-8"
          data-domain-script={process.env.GATSBY_ROCHE_ONETRUST_KEY}
        ></script>
        <script type="text/javascript" dangerouslySetInnerHTML={{ __html: 'function OptanonWrapper() {}' }}></script>
        {/* End Onetrust */}

        {headComponents}
        <script src={RecaptchaService.recaptchaApiSource} async defer></script>
        <link rel="stylesheet" href={`${src}.css`} />
        <script type="module" src={`${src}.esm.js`}></script>
        <script noModule src={`${src}.js`}></script>
      </head>
      <body>
        <div id="___gatsby" dangerouslySetInnerHTML={{ __html: body }} />
        {postBodyComponents}
      </body>
    </html>
  );
}
