import React from 'react';
import { StoryblokNodeTree } from '../../services';
import { Props } from '../types';

interface FooterProps extends Props {
  tree: StoryblokNodeTree[];
  countryCode: string;
  userTypeFromSlug: 'institutional' | 'retail' | 'advanced';
}

const Footer = 'rcm-footer' as React.ElementType;

function renderTree(leaf: StoryblokNodeTree): { userTypeSlug: string; tree: unknown } {
  // top level
  const tree = leaf.children.map((e: StoryblokNodeTree) => {
    if (e.is_folder) {
      const sitemapLinks = { text: e.name, href: e.real_path, children: [] };
      e.children.forEach((c) => {
        sitemapLinks.children.push({
          text: c.name,
          href: c.real_path,
        });
      });
      return sitemapLinks;
    }
    return { text: '', href: '' };
  });

  return { userTypeSlug: leaf.slug ? leaf.slug : leaf.real_path, tree };
}

// TODO correct typing of storyblok repsones

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCurrentTree(tree: Map<string, any>, lang = 'at-de'): unknown[] {
  const currentTree = tree.get(lang)?.children;
  return currentTree;
}

export const RcmFooter = (props: FooterProps): JSX.Element => {
  const { tree, countryCode, userTypeFromSlug } = props;

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
    <Footer
      sitemap-links={JSON.stringify(items)}
      user-type-from-slug={userTypeFromSlug}
      country-code={countryCode}
    >
      {/*
       * NOTE: Only works if renderTree is defined using the function keyword!
       *
       * To avoid managing the arguments that are passed to renderTree,
       * we pass component state as the thisArg to the mapping function.
       */}
    </Footer>
  );
};
