import React from 'react';
import { StoryblokComponent } from 'storyblok-js-client';
import { GetComponentType } from '../types';
import { blokToComponent } from './blok-to-component';
import { FilteredProps } from './filter-props';

export const slottedToComponents = (
  getComponent: GetComponentType, slotted: FilteredProps['slotted'],
): JSX.Element[] => Object.keys(slotted).map((childSlotName) => {
  const components = ((
    slotted[childSlotName] instanceof Array ? slotted[childSlotName] : [slotted[childSlotName]]
  ) as StoryblokComponent<string>[]);

  if (!components.length) {
    return <></>;
  }

  if (childSlotName === 'unnamed') {
    return (
      <>
        {components.map((component) => blokToComponent({ getComponent, blok: component }))}
      </>
    );
  }
  return components.length === 1 ? (
    blokToComponent({ getComponent, blok: components[0], slot: childSlotName })
  ) : (
    <div slot={childSlotName}>
      {components.map((component) => blokToComponent({ getComponent, blok: component }))}
    </div>
  );
});
