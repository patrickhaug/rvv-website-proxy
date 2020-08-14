import React, { Component } from 'react';
import StoryblokReact from 'storyblok-react';
import { Story } from 'storyblok-js-client';
import { getComponent } from '../components';
import { StoryblokService } from '../services';
import { EntryData } from '../template';

type StoryblokEntryState = EntryData;

const Navigation = getComponent('navigation');

const loadStoryblokBridge = (onLoadHandler: EventListener): void => {
  const storyblokConfig = StoryblokService.getConfig();
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `//app.storyblok.com/f/storyblok-latest.js?t=${storyblokConfig.options.accessToken}`;
  script.onload = onLoadHandler;
  document.getElementsByTagName('head')[0].appendChild(script);
};

// eslint-disable-next-line import/no-default-export
export default class StoryblokEntry extends Component<null, StoryblokEntryState> {
  public constructor() {
    super(null);
    this.state = {
      story: null,
      navigation: { content: {} },
    } as StoryblokEntryState;
    this.handleStoryblokLoad = this.handleStoryblokLoad.bind(this);
    this.loadStory = this.loadStory.bind(this);
  }

  public componentDidMount(): void {
    loadStoryblokBridge(this.handleStoryblokLoad);
  }

  public render(): JSX.Element {
    const { story, navigation } = this.state;

    if (story == null) {
      return <div></div>;
    }

    return (
      <StoryblokReact content={story.content}>
        <Navigation blok={navigation.content} getComponent={getComponent}></Navigation>
        {React.createElement(getComponent(story.content.component), {
          // eslint-disable-next-line no-underscore-dangle
          key: story.content._uid,
          blok: story.content,
          getComponent,
        })}
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
          this.setState({ story });
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
          this.setState({ story });
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
