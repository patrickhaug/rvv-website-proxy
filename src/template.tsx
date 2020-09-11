import React, { Component } from 'react';
import { StoryData } from 'storyblok-js-client';
import { getComponent } from './components';

export interface EntryData {
  story: StoryData;
  navigation: StoryData;
  pageId: string;
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
  return { story, navigation, pageId: pageContext.pageId };
};

const Navigation = getComponent('navigation');

const RochePageId = 'roche-page-id' as React.ReactType;

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
    const { story, navigation, pageId } = this.state;
    return (
      <>
        <RochePageId data-id={pageId}></RochePageId>
        <Navigation blok={navigation.content} getComponent={getComponent}></Navigation>
        {React.createElement(getComponent(story.content.component), {
          // eslint-disable-next-line no-underscore-dangle
          key: story.content._uid,
          blok: story.content,
          getComponent,
        })}
      </>
    );
  }
}
