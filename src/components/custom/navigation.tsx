import React from 'react';
import { StoryblokNodeTree } from '../../services';
import { Props } from '../types';

interface NavigationProps extends Props {
  tree: StoryblokNodeTree[];
  currentCountry: string;
  currentLanguage: string;
  userType: 'insti' | 'retail' | 'advanced';
}

const Navigation = 'rcm-navigation' as React.ElementType;

function renderTree(leaf: StoryblokNodeTree): {text: string; href: string} {
  // top level
  if (leaf.is_folder) {
    const tabEntry = { text: leaf.name, href: leaf.real_path, children: [] };
    leaf.children.forEach((c) => {
      tabEntry.children.push({
        text: c.name,
        href: c.real_path,
      });
    });

    return tabEntry;
  }
  return { text: '', href: '' };
}

// TODO correct typing of storyblok repsones

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCurrentTree(tree: Map<string, any>, lang = 'AT - DE', type = 'Retail'): unknown[] {
  const currentTree = tree.get(lang).children.filter((c) => c.name === type)[0].children;
  return currentTree;
}

export const RcmNavigation = (props: NavigationProps): JSX.Element => {
  const {
    tree,
    currentCountry,
    currentLanguage,
  } = props;

  if (!tree) {
    return null;
  }

  // Store the tree in a language map
  const langMap = new Map();
  tree.forEach((t) => {
    if (!langMap.has(t.name)) { langMap.set(t.name, t); }
  });

  // We need the custom component, otherwise jsx does not render the attributes
  return (
    <Navigation
      tab-entries={JSON.stringify(getCurrentTree(langMap).map(renderTree))}
      current-language={currentLanguage}
      current-country={currentCountry}
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
