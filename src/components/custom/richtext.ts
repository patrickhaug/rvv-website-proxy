import React from 'react';
import StoryblokClient, { Richtext } from 'storyblok-js-client';
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
 * In order to maximize reusability of Storyblok's richTextResolver,
 * we use pattern matching and work directly on the "stringified markup" output by their tools.
 *
 * NOTE: The editor can still make links behave like their own Blok,
 * by inserting 2 carriage returns, instead of 1, after a paragraph.
 */
const forceLinksInsideParagraphs = (markupString: string): string => markupString
  .replace(/<\/p><roche-text-link/gm, ' <roche-text-link')
  .replace(/<\/roche-text-link><p>/gm, '</roche-text-link> ')
  .replace(/<p><\/p>/, '');

/**
 * External Links are written by the Storyblok helper as `href="/http://…"`
 * However, they should not have the initial slash. This function removes it.
 */
const fixExternalLinks = (markupString: string): string => markupString
  .replace(/href="\/https:\/\//gm, 'href="https://')
  .replace(/href="\/http:\/\//gm, 'href="http://');

const markupFromRichtextField = (storyblokHtmlSchema: Richtext): string => fixExternalLinks(
  forceLinksInsideParagraphs(storyblokClient.richTextResolver.render(storyblokHtmlSchema)),
);

export const RocheRichtext = ({ blok, slot }: AnyProps): JSX.Element => React.createElement(
  'roche-richtext',
  {
    // eslint-disable-next-line no-underscore-dangle
    uid: blok._uid,
    slot,
    'capitalize-first-Letter': blok.capitalize_first_letter || undefined,
    footnote: blok.footnote || undefined,
    dangerouslySetInnerHTML: { __html: markupFromRichtextField(blok.text) },
  },
);
