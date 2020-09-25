import React, { Component } from 'react';
import StoryblokReact from 'storyblok-react';
import { Story } from 'storyblok-js-client';
import { getComponent, blokToComponent } from '../components';
import { DomService, StoryblokService } from '../services';
import { EntryData } from '../template';

type StoryblokEntryState = EntryData;

const RocheGlobalConfig = getComponent('roche-global-config') as React.ReactType;
const Navigation = getComponent('roche-navigation');

const loadStoryblokBridge = (onLoadHandler: EventListener): void => {
  const script = DomService.createElement('script', '', {
    src: `//app.storyblok.com/f/storyblok-latest.js?t=${StoryblokService.getConfig().options.accessToken}`,
  });
  script.onload = onLoadHandler;
  document.head.appendChild(script);
};

// eslint-disable-next-line import/no-default-export
export default class StoryblokEntry extends Component<object, StoryblokEntryState> {
  public constructor(props: object) {
    super(props);
    this.handleStoryblokLoad = this.handleStoryblokLoad.bind(this);
    this.loadStory = this.loadStory.bind(this);

    this.state = {
      navigation: { content: {} },
    } as StoryblokEntryState;
  }

  public componentDidMount(): void {
    loadStoryblokBridge(this.handleStoryblokLoad);
  }

  public render(): JSX.Element {
    const { story, navigation, ...globalConfig } = this.state;

    if (!story) {
      return <div></div>;
    }

    return (
      <StoryblokReact content={story.content}>
        <RocheGlobalConfig {...globalConfig}></RocheGlobalConfig>
        <Navigation blok={navigation.content} getComponent={getComponent}></Navigation>
        {blokToComponent({ blok: story.content, getComponent })}
      </StoryblokReact>
    );
  }

  private handleStoryblokLoad(): void {
    this.loadStory();
    const storyblok = StoryblokService.getObject();

    if (storyblok) {
      storyblok.on(['change', 'published'], this.loadStory);

      storyblok.on('input', (data: Story['data']) => {
        const { story: currentStory } = this.state;
        const story = data?.story;

        if (currentStory && currentStory.id === story.id) {
          story.content = storyblok.addComments(story.content, story.id);
          this.setState({ story, ...DomService.getGlobalConfig(story.uuid) });
        }
      });

      storyblok.pingEditor(() => {
        if (storyblok.inEditor) {
          storyblok.enterEditmode();
        }
      });
    }
  }

  private loadStory(): void {
    const storyblok = StoryblokService.getObject();
    const storyblokConfig = StoryblokService.getConfig();

    if (storyblok && storyblokConfig) {
      const currentPath = storyblok.getParam('path');
      storyblok.get(
        {
          slug: currentPath === '/' ? '/home' : currentPath,
          version: 'draft',
          // eslint-disable-next-line @typescript-eslint/camelcase
          resolve_relations: storyblokConfig.options.resolveRelations || [],
        },
        ({ story }) => {
          this.setState({ story, ...DomService.getGlobalConfig(story.uuid) });
          this.loadGlobalNavigation(story.lang);
        },
      );
    }
  }

  private loadGlobalNavigation(lang: string): void {
    const language = lang === 'default' ? '' : `${lang}/`;
    const storyblok = StoryblokService.getObject();

    if (storyblok) {
      storyblok.get(
        {
          slug: `${language}navigation`,
          version: 'draft',
        },
        ({ story }: Story['data']) => {
          this.setState({ navigation: story });
        },
      );
    }
  }
}
