import React, { ReactType } from 'react';
import { StoryblokComponent } from 'storyblok-js-client';
import { ConversionService } from '../services';
import { filterProps, slottedToComponents } from './helpers';
import { Props } from './types';

export const Default = (
  { blok, getComponent, slot }: Props<StoryblokComponent<string>>,
): JSX.Element => {
  const { props, slotted } = filterProps(blok);
  const allProps = {
    ...props,
    ...(slot ? { slot } : {}),
    // eslint-disable-next-line no-underscore-dangle
    ...(blok._uid ? { uid: blok._uid } : {}),
  };

  const CustomComponent = ConversionService.camelToKebab(blok.component) as ReactType;
  const children = slottedToComponents(getComponent, slotted);
  return (
    <CustomComponent {...allProps}>{children}</CustomComponent>
  );
};
