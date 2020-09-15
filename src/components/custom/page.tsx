import React from 'react';
import { SbEditableContent } from 'storyblok-react';
import { blokToComponent } from '../helpers';
import { Props } from '../types';

type PageProps = Props<{ body: SbEditableContent[] }>;

export const Page = ({ blok, getComponent }: PageProps): JSX.Element => (
  <>
    {blok.body && blok.body.map((item) => blokToComponent(
      { blok: item, getComponent }, 'page',
    ))}
  </>
);
