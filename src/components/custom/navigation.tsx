import React from 'react';
import { StoryblokNodeTree } from '../../services';
import { Props } from '../types';

interface NavigationProps extends Props {
  tree: StoryblokNodeTree[];
  currentCountry: string;
  currentLanguage: string;
  countryCode: string;
  userTypeFromSlug: 'institutional' | 'retail';
  alternates: string;
}

const Navigation = 'rvv-navigation' as React.ElementType;

const cleanSlug = (slug: string) => {
  const slugs = slug.split('/');

  if (slugs[1].includes('-')) return slugs.join('/');
  slugs.splice(1, 1);
  return slugs.join('/');
};

function renderTree(leaf: StoryblokNodeTree): {
  userTypeSlug: string;
  tree: unknown;
} {
  // top level
  const tree = leaf.children.map((e: StoryblokNodeTree) => {
    if (e.is_folder) {
      const tabEntry = {
        text: e.name,
        href: cleanSlug(e.real_path),
        children: [],
      };
      e.children.forEach((c) => {
        if (!c.page?.content?.hide_in_navigation) {
          tabEntry.children.push({
            text: c.page?.content?.navigation_title || c.name,
            href: cleanSlug(c.real_path),
          });
        }
      });
      return tabEntry;
    }
    return { text: '', href: '' };
  });
  return {
    userTypeSlug: leaf.slug ? leaf.slug : leaf.real_path.substring(1),
    tree,
  };
}

// TODO correct typing of storyblok repsones

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCurrentTree(tree: Map<string, any>, lang = 'at-de'): unknown[] {
  const currentTree = tree.get(lang)?.children;
  return currentTree;
}

export const rvvNavigation = (props: NavigationProps): JSX.Element => {
  const {
    tree, currentCountry, currentLanguage, countryCode, userTypeFromSlug, alternates,
  } = props;

  if (!tree) {
    return null;
  }

  // Store the tree in a language map
  const langMap = new Map();
  tree.forEach((t) => {
    const key = t.slug ? t.slug : t.name.toLowerCase().replace(' - ', '-');
    if (!langMap.has(key)) {
      langMap.set(key, t);
    }
  });
  const currentTree = getCurrentTree(langMap, countryCode);
  const items = currentTree ? currentTree.map(renderTree) : [];

  // We need the custom component, otherwise jsx does not render the attributes
  return (
    <Navigation
      tab-entries={JSON.stringify(items)}
      current-language={currentLanguage}
      current-country={currentCountry}
      user-type-from-slug={userTypeFromSlug}
      country-code={countryCode}
      alternates={alternates}
    >
      {/*
       * NOTE: Only works if renderTree is defined using the function keyword!
       *
       * To avoid managing the arguments that are passed to renderTree,
       * we pass component state as the thisArg to the mapping function.
       */}
    </Navigation>
  );
};
