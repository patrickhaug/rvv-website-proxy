import React from 'react';
import StoryblokClient from 'storyblok-js-client';
import { StoryblokService } from '../../services';
import { AnyProps } from '../types';

interface LinkComponentProps {
  text?: string;
  target?: string;
  icon?: string;
  link: {
    cached_url: string;
    anchor: string;
    url: string;
  };
}

const rootAlias = 'home';

const componentPropRenderer = {
  'rvv-text-link': (blok: LinkComponentProps): string => {
    const { cached_url, anchor, url } = blok.link;
    const parsedLink = url || `/${cached_url.replace(rootAlias, '')}${anchor ? `#${anchor}` : ''}`.replace('//', '/');
    return (
      `href="${parsedLink}" text="${blok.text}" target="${blok.target}" icon="${blok.icon}"`
    );
  },
};

const storyblokClient = new StoryblokClient({
  accessToken: StoryblokService.getConfig().options.accessToken as string,
});

storyblokClient.setComponentResolver((component, blok): string => (
  `<${component} ${componentPropRenderer[component](blok)}></${component}>`
));

export const rvvEditorialTextBlock = ({ blok, slot }: AnyProps): JSX.Element => React.createElement(
  'rvv-editorial-text-block',
  {
    // eslint-disable-next-line no-underscore-dangle
    uid: blok._uid,
    slot,
    headline: blok.headline,
    full: blok.full,
    dangerouslySetInnerHTML: { __html: storyblokClient.richTextResolver.render(blok.text) },
  },
);
