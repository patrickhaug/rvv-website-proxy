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
  };
}

const componentPropRenderer = {
  'roche-text-link': (blok: LinkComponentProps): string => (
    `href="/${blok.link.cached_url}" text="${blok.text}" target="${blok.target}" icon="${blok.icon}"`
  ),
};

const storyblokClient = new StoryblokClient({
  accessToken: StoryblokService.getConfig().options.accessToken as string,
});

storyblokClient.setComponentResolver((component, blok): string => (
  `<${component} ${componentPropRenderer[component](blok)}></${component}>`
));

/**
 * Storyblok's richtext editor always forces blok level components to close the previous "tag".
 *
 * This means we need to combine the <p> tags surrounding the roche-text-link into the same one,
 * with roche-text-link as their child
 *
 * In order to maximize reusability of Storybloks richTextResolver,
 * we use pattern matching and work directly on the "stringified markup" output by their tools.
 *
 * NOTE: The editor can stil make links behave like their own Blok,
 * by insterting 2 carriage returns, instead of 1, after a paragraph.
 */
const ForceLinksInsideParagraphs = (markupString: string): string => markupString
  .replace(/<\/p><roche-text-link/gm, ' <roche-text-link')
  .replace(/<\/roche-text-link><p>/gm, '</roche-text-link> ')
  .replace(/<p><\/p>/, '');

const markupFromRichtextField = (storyblokHtmlSchema): string => ForceLinksInsideParagraphs(
  storyblokClient.richTextResolver.render(storyblokHtmlSchema),
);

export const RocheRichtext = ({ blok }: AnyProps): JSX.Element => React.createElement(
  'roche-richtext',
  {
    'capitalize-first-Letter': blok.capitalize_first_letter || undefined,
    footnote: blok.footnote || undefined,
    dangerouslySetInnerHTML: { __html: markupFromRichtextField(blok.text) },
  },
);
