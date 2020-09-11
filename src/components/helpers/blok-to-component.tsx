import React from 'react';
import { StoryblokComponent } from 'storyblok-js-client';
import { Props } from '../types';

export const blokToComponent = (
  { blok, getComponent, slot }: Props<StoryblokComponent<string>>,
): JSX.Element => {
  const CustomChild = getComponent(blok.component);
  return (
    <CustomChild blok={blok} getComponent={getComponent} slot={slot}></CustomChild>
  );
};
