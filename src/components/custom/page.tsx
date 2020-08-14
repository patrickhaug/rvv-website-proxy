import React from 'react';
import { SbEditableContent } from 'storyblok-react';
import { Props } from '../types.js';

type PageProps = Props<{ body: SbEditableContent[] }>;

export const Page = ({ blok, getComponent }: PageProps): JSX.Element => (
  <>
    {blok.body && blok.body.map((item) => React.createElement(getComponent(item.component), {
      // eslint-disable-next-line no-underscore-dangle
      key: item._uid,
      blok: item,
      getComponent,
    }))}
  </>
);
