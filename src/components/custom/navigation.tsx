import React from 'react';
import { StoryblokNodeTree } from '../../services';
import { Props } from '../types';

interface NavigationProps extends Props {
  tree: StoryblokNodeTree[];
}

const RocheGenericLink = 'roche-generic-link' as React.ReactType;
const RocheNavigationComponent = 'roche-navigation' as React.ReactType;
const RocheIconComponent = 'roche-icon' as React.ReactType;
const RocheGrid = 'roche-grid' as React.ReactType;
const RocheTeaser = 'roche-teaser' as React.ReactType;
const RocheButton = 'roche-button' as React.ReactType;
const RocheImage = 'roche-image' as React.ReactType;

const renderStartPageOverview = (leaf: StoryblokNodeTree): JSX.Element => {
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
    <RocheGrid layout="6-6" full-width>
      <div slot="left">
        <h3 className="headline" slot="left">{navigation_title}</h3>
        <h4 className="subline" slot="left">{navigation_subline}</h4>
        <RocheButton target="_self" text="Learn more" secondary icon="overview" is-dark-background href={leaf.real_path}></RocheButton>
      </div>
      <div slot="right">
        {highlights && highlights.length > 0 && (
          <>
            <h3 className="headline headline--highlights">Highlights</h3>
            <div className="teaser-container">
              {highlights.map((highlight) => {
                if (!highlight.page || !highlight.page.story) {
                  return null;
                }

                return (
                  <RocheTeaser
                    // eslint-disable-next-line no-underscore-dangle
                    key={highlight.page.story._id}
                    size="navigation"
                    teaser-url={highlight.page.cached_url}
                  >
                    <RocheImage slot="media" src={highlight.page.story.content.highlight_image.filename} ratio="16:9" />
                    <RocheGenericLink
                      slot="link"
                      data-theme="dark"
                      size="navigation"
                      target="_self"
                      text={highlight.page.story.highlight_title
                        || highlight.page.story.content.highlight_title}
                      url={highlight.page.cached_url}
                      icon="chevron-right-bold"
                    >
                    </RocheGenericLink>
                  </RocheTeaser>
                );
              })}
            </div>
          </>
        )}
      </div>
    </RocheGrid>
  );
  /* eslint-enable @typescript-eslint/camelcase */
};

const renderTree = (leaf: StoryblokNodeTree): JSX.Element => {
  const link = (
    <RocheGenericLink
      data-theme="dark"
      size="navigation"
      target="_self"
      url={leaf.real_path}
      text={leaf.page?.content.navigation_title || leaf.page?.name || 'Page has no name'}
    >
    </RocheGenericLink>
  );

  // home edge case
  if (leaf.parent_id === 0 && !leaf.is_folder) {
    return (
      <ul key={leaf.id}>
        <li>
          {link}
          {renderStartPageOverview(leaf)}
        </li>
      </ul>
    );
  }

  // top level
  if (leaf.is_folder && leaf.parent_id === 0) {
    return (
      <ul key={leaf.id}>
        {leaf.children.map(renderTree)}
      </ul>
    );
  }

  // render folders
  if (leaf.is_folder && leaf.children.length > 0) {
    return (
      <li key={leaf.id}>
        <ul>
          {leaf.children.map(renderTree)}
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
      <RocheIconComponent icon="chevron-right-bold" />
      {leaf.is_startpage && renderStartPageOverview(leaf)}
    </li>
  );
};

export const RocheNavigation = (props: NavigationProps): JSX.Element => {
  const { tree } = props;

  if (!tree) {
    return null;
  }

  return (
    <RocheNavigationComponent>
      {tree.map(renderTree)}
    </RocheNavigationComponent>
  );
};
