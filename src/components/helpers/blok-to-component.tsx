import React from 'react';
import { StoryblokComponent } from 'storyblok-js-client';
import { Props } from '../types';

export const blokToComponent = (
  props: Props<StoryblokComponent<string>>,
  keyPrefix?: string,
): JSX.Element => {
  const CustomChild = props.getComponent(props.blok.component);
  // eslint-disable-next-line no-underscore-dangle
  const key = typeof keyPrefix === 'string' ? `${keyPrefix}-${props.blok._uid}` : undefined;
  const newProps = {
    ...props,
    ...(key ? { key } : {}),
  };

  return (
    <CustomChild {...newProps}></CustomChild>
  );
};
