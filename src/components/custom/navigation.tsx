import React, { useEffect, useState } from 'react';
import { TranslationService } from '@virtualidentityag/components-library-rcm/src/services/translation/index';
import { Language, StoryblokNodeTree } from '../../services';
import { Props } from '../types';

interface NavigationProps extends Props {
  tree: StoryblokNodeTree[];
  contactUrl: string;
  contactText: string;
  languages: Language[];
}

interface NavigationState {
  translations?: {
    learnMore: string;
  };
}

const RcmGenericLink = 'rcm-generic-link' as React.ElementType;
const RcmIconComponent = 'rcm-icon' as React.ElementType;
const RcmGrid = 'rcm-grid' as React.ElementType;
const RcmTeaser = 'rcm-teaser' as React.ElementType;
const RcmButton = 'rcm-button' as React.ElementType;
const RcmImage = 'rcm-image' as React.ElementType;
const Navigation = 'rcm-navigation' as React.ElementType;

const isHomepage = (leaf: StoryblokNodeTree): boolean => (leaf.parent_id === 0 && !leaf.is_folder && leaf.real_path === `/${leaf.page?.lang !== 'default' ? `${leaf.page?.lang}/` : ''}`);

const renderStartPageOverview = (
  leaf: StoryblokNodeTree,
  componentState: NavigationState,
): JSX.Element => {
  if (leaf.real_path.split('/').length > 3 || !leaf.page?.content) {
    return null;
  }

  /**
   * Page content is and object on editor preview, but a string at build time.
   * We make sure it's parsed when needed.
   */
  const pageContent = typeof leaf.page.content === 'string'
    ? JSON.parse(leaf.page.content)
    : leaf.page.content;

  /* eslint-disable @typescript-eslint/camelcase */
  const { navigation_title, navigation_subline, highlights } = pageContent;

  return (
    <RcmGrid layout="6-6" full-width>
      <div slot="left">
        <h3 className="headline" slot="left">{navigation_title}</h3>
        <h4 className="subline" slot="left">{navigation_subline}</h4>
        <RcmButton target="_self" text={componentState.translations?.learnMore} secondary icon="overview" is-dark-background href={leaf.real_path}></RcmButton>
      </div>
      <div slot="right">
        {highlights && highlights.length > 0 && (
          <>
            <h3 className="headline headline--highlights">Highlights</h3>
            <div className="teaser-container">
              {highlights.map((highlight) => {
                if (!highlight.page || !highlight.image) {
                  return null;
                }

                return (
                  <RcmTeaser
                    // eslint-disable-next-line no-underscore-dangle
                    key={highlight.page.id}
                    size="navigation"
                    teaser-url={highlight.page.cached_url}
                  >
                    <RcmImage slot="media" src={highlight.image.filename} ratio="16:9" />
                    <RcmGenericLink
                      slot="link"
                      data-theme="dark"
                      size="navigation"
                      target="_self"
                      text={highlight.text}
                      url={highlight.page.cached_url}
                      icon="chevron-right-bold"
                    >
                    </RcmGenericLink>
                  </RcmTeaser>
                );
              })}
            </div>
          </>
        )}
      </div>
    </RcmGrid>
  );
  /* eslint-enable @typescript-eslint/camelcase */
};

function renderTree(leaf: StoryblokNodeTree): JSX.Element {
  const componentState: NavigationState = { ...this };
  const link = (
    <RcmGenericLink
      data-theme="dark"
      size="navigation"
      target="_self"
      url={leaf.real_path}
      text={leaf.page?.content.navigation_title || leaf.page?.name || 'Page has no name'}
    >
    </RcmGenericLink>
  );

  // home edge case
  if (isHomepage(leaf)) {
    return (
      <ul key={leaf.id}>
        <li>
          {link}
          {renderStartPageOverview(leaf, componentState)}
        </li>
      </ul>
    );
  }

  // top level
  if (leaf.is_folder && leaf.parent_id === 0) {
    return (
      <ul key={leaf.id}>
        {leaf.children.map(renderTree, componentState)}
      </ul>
    );
  }

  // render folders
  if (leaf.is_folder && leaf.children.length > 0) {
    return (
      <li key={leaf.id}>
        <ul>
          {leaf.children.map(renderTree, componentState)}
        </ul>
      </li>
    );
  }

  // do not render empty pages
  if (!leaf.page) {
    return null;
  }

  return (
    <li key={leaf.id}>
      {link}
      <RcmIconComponent icon="chevron-right-bold" />
      {leaf.is_startpage && renderStartPageOverview(leaf, componentState)}
    </li>
  );
}

export const RcmNavigation = (props: NavigationProps): JSX.Element => {
  const {
    tree, contactUrl, contactText, languages,
  } = props;

  if (!tree) {
    return null;
  }

  const [state, setState] = useState({});
  useEffect(() => {
    const getTranslations = async (): Promise<void> => {
      const newState: NavigationState = {
        translations: {
          learnMore: await TranslationService.translate('learn more'),
        },
      };
      setState(newState);
    };
    getTranslations();
  }, []);

  // We need the custom component, otherwise jsx does not render the attributes
  return (
    <Navigation
      contact-url={contactUrl}
      contact-text={contactText}
      languages={JSON.stringify(languages)}
    >
      {
      /*
       * NOTE: Only works if renderTree is defined using the function keyword!
       *
       * To avoid managing the arguments that are passed to renderTree,
       * we pass component state as the thisArg to the mapping function.
       */
      }
      {tree.map(renderTree, { ...state })}
    </Navigation>
  );
};
