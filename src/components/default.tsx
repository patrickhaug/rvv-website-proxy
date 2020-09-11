import React, { ReactType } from 'react';
import { StoryblokComponent } from 'storyblok-js-client';
import { ConversionService } from '../services';
import { Props } from './types';
import { filterProps } from './helpers/filter-props';
import { slottedToComponents } from './helpers/slotted-to-components';

export const Default = (
  { blok, getComponent, slot }: Props<StoryblokComponent<string>>,
): JSX.Element => {
  const { props, slotted } = filterProps(blok);
  const allProps = {
    ...props,
    ...(slot ? { slot } : {}),
  };

  const CustomComponent = ConversionService.camelToKebab(blok.component) as ReactType;
  return (
    <CustomComponent {...allProps}>{slottedToComponents(getComponent, slotted)}</CustomComponent>
  );
};
