import React, { Component } from 'react';
import { StoryData } from 'storyblok-js-client';
import { getComponent, blokToComponent } from './components';
import {
  DomService, GlobalConfigProps, StoryblokNodeTree, StoryblokService,
} from './services';
import { SEO } from './components/custom/seo';

export interface StoryDataFromGraphQLQuery extends StoryData {
  lang: string;
}

export interface EntryData extends GlobalConfigProps {
  story?: StoryDataFromGraphQLQuery;
  navigation?: StoryblokNodeTree[];
  footer?: StoryData;
}

interface StoryblokEntryProps {
  pageContext: EntryData;
}

type StoryblokEntryState = EntryData;

const parseEntryData = ({ pageContext }: StoryblokEntryProps): StoryblokEntryState => {
  const story = { ...pageContext.story };
  const footer = { ...pageContext.footer };
  story.content = JSON.parse(story.content.toString());
  footer.content = JSON.parse(footer.content.toString());

  return {
    story,
    footer,
    ...DomService.getGlobalConfig(story.uuid, story.lang),
  };
};

const RocheGlobalConfig = getComponent('roche-global-config') as React.ReactType;
const Navigation = getComponent('roche-navigation') as React.ReactType;

// eslint-disable-next-line import/no-default-export
export default class StoryblokEntry extends Component<StoryblokEntryProps, StoryblokEntryState> {
  public static getDerivedStateFromProps(
    props: StoryblokEntryProps, state: StoryblokEntryState,
  ): StoryblokEntryState {
    return state.story.uuid !== props.pageContext.story.uuid
      ? parseEntryData(props)
      : null;
  }

  public constructor(props: StoryblokEntryProps) {
    super(props);
    this.state = parseEntryData(props);
  }

  // eslint-disable-next-line class-methods-use-this
  public componentDidMount(): void {
    window.addEventListener('rocheLoginComplete', () => StoryblokService.redirect());

    /** fetch is polyfilled */
    // eslint-disable-next-line compat/compat
    fetch('/navigation-data.json')
      .then((res) => res.json())
      .then((navigationData) => this.setState({
        navigation: navigationData[this.state.story.lang],
      }));
  }

  public render(): JSX.Element {
    const {
      story, navigation, footer, ...globalConfig
    } = this.state;

    return (
      <>
        <SEO {...story.content.meta_tags} lang={story.lang} slug={story.full_slug}></SEO>
        <RocheGlobalConfig {...globalConfig}></RocheGlobalConfig>
        <Navigation tree={navigation}></Navigation>
        {blokToComponent({ blok: story.content, getComponent })}
        {blokToComponent({ blok: footer.content, getComponent })}
      </>
    );
  }
}
