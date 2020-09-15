import React from 'react';
import { RecaptchaService } from './services';

const getComponentsURL = (): string => process.env.GATSBY_ROCHE_COMPONENTS_LIBRARY_URL
  || 'http://localhost:3333/dist';

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
