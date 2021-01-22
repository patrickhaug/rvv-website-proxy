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
        {/* Recatpcha and Recaptcha triggering on consent */}
        <script
          src={RecaptchaService.recaptchaApiSource}
          type="text/plain"
          className="optanon-category-C0004"
        ></script>
        <script
          type="text/plain"
          className="optanon-category-C0004"
          dangerouslySetInnerHTML={{ __html: 'window.dispatchEvent(new CustomEvent("rocheRecaptchaAvailable"));' }}
        ></script>
        {/* End Recaptcha triggering on consent */}
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
