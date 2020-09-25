import React, { Component } from 'react';
import { StoryData } from 'storyblok-js-client';
import { getComponent, blokToComponent } from './components';
import { DomService, GlobalConfigProps } from './services';

export interface EntryData extends GlobalConfigProps {
  story: StoryData;
  navigation: StoryData;
}

interface StoryblokEntryProps {
  pageContext: EntryData;
}

type StoryblokEntryState = EntryData;

const parseEntryData = ({ pageContext }: StoryblokEntryProps): StoryblokEntryState => {
  const story = { ...pageContext.story };
  const navigation = { ...pageContext.navigation };
  story.content = JSON.parse(story.content.toString());
  navigation.content = JSON.parse(navigation.content.toString());
  return {
    story,
    navigation,
    ...DomService.getGlobalConfig(story.uuid),
  };
};

const RocheGlobalConfig = getComponent('roche-global-config') as React.ReactType;
const Navigation = getComponent('roche-navigation');

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

  public render(): JSX.Element {
    const { story, navigation, ...globalConfig } = this.state;
    return (
      <>
        <RocheGlobalConfig {...globalConfig}></RocheGlobalConfig>
        <Navigation blok={navigation.content} getComponent={getComponent}></Navigation>
        {blokToComponent({ blok: story.content, getComponent })}
      </>
    );
  }
}
