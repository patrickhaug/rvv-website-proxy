import React from 'react';
import { StoryblokNodeTree } from '../../services';
import { Props } from '../types';

interface FooterProps extends Props {
  tree: StoryblokNodeTree[];
}

const Footer = 'rcm-footer' as React.ElementType;

function renderTree(leaf: StoryblokNodeTree): {text: string; href: string}[] {
  // top level
  if (leaf.is_folder) {
    const sitemapLinks = [{ text: leaf.name, href: leaf.real_path }];
    leaf.children.forEach((c) => {
      sitemapLinks.push({
        text: c.name,
        href: c.real_path,
      });
    });

    return sitemapLinks;
  }
  return [{ text: '', href: '' }];
}

// TODO correct typing of storyblok repsones

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCurrentTree(tree: Map<string, any>, lang = 'AT - DE', type = 'Retail'): unknown[] {
  const currentTree = tree.get(lang).children.filter((c) => c.name === type)[0].children;
  return currentTree;
}

export const RcmFooter = (props: FooterProps): JSX.Element => {
  const {
    tree,
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
    <Footer
      sitemap-links={JSON.stringify(getCurrentTree(langMap).map(renderTree))}
    >
      {
      /*
       * NOTE: Only works if renderTree is defined using the function keyword!
       *
       * To avoid managing the arguments that are passed to renderTree,
       * we pass component state as the thisArg to the mapping function.
       */
      }
    </Footer>
  );
};
