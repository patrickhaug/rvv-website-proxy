import { StoryblokComponent } from 'storyblok-js-client';
import { ConversionService } from '../../services';

export interface FilteredProps {
  props: Record<string, string>;
  slotted: Record<string, StoryblokComponent<string> | StoryblokComponent<string>[]>;
  hidden: Record<string, StoryblokComponent<string> | StoryblokComponent<string>[]>;
}

const shouldBePrinted = (value: unknown): boolean => !(
  value === null || value === undefined || value === false
);

const toHTMLAttribute = (value: unknown): string => (
  value instanceof Object ? JSON.stringify(value) : value.toString()
);

export const filterProps = (blok: StoryblokComponent<string>): FilteredProps => {
  const keys = Object.keys(blok).filter((key) => key && key[0] !== '_' && key !== 'component');
  const slottedKeys = keys.filter((key) => key === 'slotted' || key.indexOf('slotted_') === 0);
  const hiddenKeys = keys.filter((key) => key === 'hidden' || key.indexOf('hidden_') === 0);
  return {
    props: keys
      .filter((key) => slottedKeys.indexOf(key) < 0 && hiddenKeys.indexOf(key) < 0)
      .reduce((accumulator, key) => ({
        ...accumulator,
        ...(shouldBePrinted(blok[key]) ? {
          [ConversionService.snakeToKebab(key)]: toHTMLAttribute(blok[key]),
        } : {}),
      }), {}),
    slotted: slottedKeys.reduce((accumulator, key) => ({
      ...accumulator,
      [ConversionService.snakeToKebab(key === 'slotted' ? 'unnamed' : key.substr('slotted_'.length))]: blok[key],
    }), {}),
    hidden: hiddenKeys.reduce((accumulator, key) => ({
      ...accumulator,
      [ConversionService.snakeToKebab(key === 'hidden' ? 'unnamed' : key.substr('hidden_'.length))]: blok[key],
    }), {}),
  };
};