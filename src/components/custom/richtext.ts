import React from 'react';
import StoryblokClient from 'storyblok-js-client';
import { StoryblokService } from '../../services';
import { AnyProps } from '../types';

const storyblokClient = new StoryblokClient({
  accessToken: StoryblokService.getConfig().options.accessToken as string,
});

const markupFromRichtextField = (storyblokHTML): object => ({
  __html: storyblokClient.richTextResolver.render(storyblokHTML),
});

export const RocheRichtext = ({ blok }: AnyProps): JSX.Element => React.createElement(
  'roche-richtext',
  {
    'capitalize-first-Letter': blok.capitalize_first_letter || undefined,
    footnote: blok.footnote || undefined,
    dangerouslySetInnerHTML: markupFromRichtextField(blok.text),
  },
);
