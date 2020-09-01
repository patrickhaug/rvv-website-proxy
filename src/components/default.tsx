import React, { ReactType } from 'react';
import { StoryblokComponent } from 'storyblok-js-client';
import { ConversionService } from '../services';
import { Props } from './types';

interface FilteredProps {
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

const filterProps = (blok: StoryblokComponent<string>): FilteredProps => {
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

export const Default = ({ blok, getComponent }: Props<StoryblokComponent<string>>): JSX.Element => {
  const { props, slotted } = filterProps(blok);
  const CustomComponent = ConversionService.camelToKebab(blok.component) as ReactType;
  const children = Object.keys(slotted).map((name: string, index) => {
    const components = ((
      slotted[name] instanceof Array ? slotted[name] : [slotted[name]]
    ) as StoryblokComponent<string>[]).map((item, innerIndex) => {
      const CustomChild = getComponent(item.component);
      return (
        <CustomChild blok={item} key={`unnamed-${index}-${innerIndex}`} getComponent={getComponent}></CustomChild>
      );
    });

    return name === 'unnamed' ? components : (
      <slot name={name} key={`${name}-${index}`}>
        {components}
      </slot>
    );
  });
  return (
    <CustomComponent {...props}>{children}</CustomComponent>
  );
};
