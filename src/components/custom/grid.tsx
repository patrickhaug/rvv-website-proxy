import React from 'react';
import { AnyProps } from '../types';

const gridSettings = {
  tagName: 'roche-grid',
  storyblokLayoutMap: {
    'grid-12': '12',
    'grid-8': '8',
    'grid-6-6': '6-6',
    'grid-8-4': '8-4',
    'grid-4-4-4': '4-4-4',
    'grid-3-3-3-3': '3-3-3-3',
  },
  storyblokGridAreasMap: {
    left: 'left',
    // eslint-disable-next-line @typescript-eslint/camelcase
    center_left: 'center-left',
    center: 'center',
    // eslint-disable-next-line @typescript-eslint/camelcase
    center_right: 'center-right',
    right: 'right',
    components: '', // for single area layouts
  },
};

const getlayoutType = (id: string, layouts = gridSettings.storyblokLayoutMap): string => {
  if (!layouts[id]) {
    throw new Error(
      `${gridSettings.tagName}: could not find a layout match for ${id} component.`,
    );
  }
  return layouts[id];
};

const buildChildrenRenderFunction = (
  getComponent: Function,
  gridArea = undefined,
) => (child): JSX.Element => React.createElement(
  getComponent(child.component),
  {
    // eslint-disable-next-line no-underscore-dangle
    key: child._uid,
    blok: {
      ...child,
      slot: gridArea || undefined,
      getComponent,
    },
  },
);

const matchEditorAreaNames = (key: string): boolean => Object
  .keys(gridSettings.storyblokGridAreasMap)
  .indexOf(key) > -1;

const Grid = ({ blok, getComponent }: AnyProps): JSX.Element => React.createElement(
  gridSettings.tagName,
  {
    layout: getlayoutType(blok.component),
    fullWidth: blok.full_width,
  },
  Object.keys(blok)
    .filter(matchEditorAreaNames)
    .map((editorName) => blok[editorName].map(
      buildChildrenRenderFunction(
        getComponent,
        gridSettings.storyblokGridAreasMap[editorName],
      ),
    )),
);

const buildGridComponentMatches = (
  storyblokComponentsMap = gridSettings.storyblokLayoutMap,
): Record<string, Function> => Object.keys(storyblokComponentsMap).reduce(
  (accumulator, componentName) => ({
    ...accumulator,
    [componentName]: Grid,
  }),
  {},
);

export const gridComponents = buildGridComponentMatches();
