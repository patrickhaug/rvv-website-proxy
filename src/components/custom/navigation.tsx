import React from 'react';
import { StoryblokNodeTree } from '../../services';
import { Props } from '../types';

interface NavigationProps extends Props {
  tree: StoryblokNodeTree[];
  currentCountry: string;
  currentLanguage: string;
  countryCode: string;
  userTypeFromSlug: 'institutional' | 'retail' | 'advanced';
}

const Navigation = 'rcm-navigation' as React.ElementType;

function renderTree(leaf: StoryblokNodeTree): { userTypeSlug: string; tree: unknown } {
  // top level
  const tree = leaf.children.map((e: StoryblokNodeTree) => {
    if (e.is_folder) {
      const tabEntry = { text: e.name, href: e.real_path, children: [] };
      e.children.forEach((c) => {
        tabEntry.children.push({
          text: c.name,
          href: c.real_path,
        });
      });
      return tabEntry;
    }
    return { text: '', href: '' };
  });

  return { userTypeSlug: leaf.slug, tree };
}

// TODO correct typing of storyblok repsones

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCurrentTree(tree: Map<string, any>, lang = 'at-de'): unknown[] {
  const currentTree = tree.get(lang).children;
  return currentTree;
}

export const RcmNavigation = (props: NavigationProps): JSX.Element => {
  const {
    tree,
    currentCountry,
    currentLanguage,
    countryCode,
    userTypeFromSlug,
  } = props;

  if (!tree) {
    return null;
  }

  // Store the tree in a language map
  const langMap = new Map();
  tree.forEach((t) => {
    if (!langMap.has(t.slug)) { langMap.set(t.slug, t); }
  });

  // We need the custom component, otherwise jsx does not render the attributes
  return (
    <Navigation
      tab-entries={JSON.stringify(getCurrentTree(langMap, countryCode).map(renderTree))}
      current-language={currentLanguage}
      current-country={currentCountry}
      user-type-from-slug={userTypeFromSlug}
      country-code={countryCode}
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
