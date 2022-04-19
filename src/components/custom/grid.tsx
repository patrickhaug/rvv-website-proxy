import React from 'react';
import { StoryblokComponent } from 'storyblok-js-client';
import { blokToComponent } from '../helpers';
import { Props } from '../types';

const tagName = 'rvv-grid';

const storyblokLayoutMap = {
  'rvv-grid-12': '12',
  'rvv-grid-8': '8',
  'rvv-grid-6-6': '6-6',
  'rvv-grid-8-4': '8-4',
  'rvv-grid-4-4-4': '4-4-4',
  'rvv-grid-3-3-3-3': '3-3-3-3',
};

const storyblokGridAreasMap = {
  slotted_left: 'left',
  slotted_center_left: 'center-left',
  slotted_center: 'center',
  slotted_center_right: 'center-right',
  slotted_right: 'right',
  slotted: '',
};

const getLayoutType = (id: string): string => {
  if (!storyblokLayoutMap[id]) {
    throw new Error(
      `${tagName}: could not find a layout match for ${id} component.`,
    );
  }
  return storyblokLayoutMap[id];
};

const Grid = ({ blok, getComponent }: Props): JSX.Element => React.createElement(
  tagName,
  {
    layout: getLayoutType(blok.component),
    'full-width': blok.full_width,
    color: blok.color,
    slot: blok.slot,
  },
  Object.keys(blok)
    .filter((attributeName) => attributeName.substr(0, 'slotted'.length) === 'slotted')
    .map((attributeName) => blok[attributeName].map(
      (component: StoryblokComponent<string>) => blokToComponent({
        blok: component,
        getComponent,
        slot: storyblokGridAreasMap[attributeName],
      }, 'grid'),
    )),
);

export const gridComponents = Object
  .keys(storyblokLayoutMap)
  .reduce((accumulator, componentName) => ({
    ...accumulator,
    [componentName]: Grid,
  }), {});
