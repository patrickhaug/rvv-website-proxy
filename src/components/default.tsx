import React, { ReactType } from 'react';
import { StoryblokComponent } from 'storyblok-js-client';
import { StringService } from '../services';
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
    // eslint-disable-next-line no-underscore-dangle
    ...((blok.id || blok._uid) ? { id: blok.id || blok._uid } : {}),
  };

  const CustomComponent = StringService.camelToKebab(blok.component) as ReactType;
  const children = slottedToComponents(getComponent, slotted);
  return (
    <CustomComponent {...allProps}>{children}</CustomComponent>
  );
};
