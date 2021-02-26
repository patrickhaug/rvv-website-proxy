import React from 'react';
import { Helmet } from 'react-helmet';
import { SbEditableContent } from 'storyblok-react';
import { blokToComponent } from '../helpers';
import { Props } from '../types';

type PageProps = Props<{ body: SbEditableContent[] }>;

const Page = ({ blok, getComponent }: PageProps): JSX.Element => (
  <>
    <Helmet
      htmlAttributes={{
        class: `theme--${blok.component?.split('_').pop()}`,
      }}
    />

    {blok.body && blok.body.map((item) => blokToComponent(
      { blok: item, getComponent }, 'page',
    ))}
  </>
);

export const contentEntries = ['page', 'article', 'article_participate']
  .reduce((accumulator, componentName) => ({
    ...accumulator,
    [componentName]: Page,
  }), {});
