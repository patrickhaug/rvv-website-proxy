import React from 'react';
import { StoryblokNodeTree } from '../../services';
import { Props } from '../types';

interface NavigationProps extends Props {
  tree: StoryblokNodeTree[];
}

const Navigation = 'rcm-navigation' as React.ElementType;

function renderTree(leaf: StoryblokNodeTree): {text: string; href: string} {
  // top level
  if (leaf.is_folder && leaf.parent_id === 0) {
    const tabEntry = { text: leaf.name, href: leaf.real_path };
    return tabEntry;
  }
  return { text: '', href: '' };
}

export const RcmNavigation = (props: NavigationProps): JSX.Element => {
  const {
    tree,
  } = props;

  if (!tree) {
    return null;
  }

  // We need the custom component, otherwise jsx does not render the attributes
  return (
    <Navigation
      tab-entries={JSON.stringify(tree.map(renderTree))}
    >
      {
      /*
       * NOTE: Only works if renderTree is defined using the function keyword!
       *
       * To avoid managing the arguments that are passed to renderTree,
       * we pass component state as the thisArg to the mapping function.
       */
      }
    </Navigation>
  );
};
