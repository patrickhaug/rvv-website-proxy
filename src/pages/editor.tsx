import React, { Component } from 'react';
import StoryblokReact from 'storyblok-react';
import StoryblokClient, { Story } from 'storyblok-js-client';
import { getComponent, blokToComponent } from '../components';
import {
  DomService, StoryblokService, NavigationService,
} from '../services';
import { EntryData, StoryDataFromGraphQLQuery } from '../template';

type StoryblokEntryState = EntryData;

const RocheGlobalConfig = getComponent('roche-global-config') as React.ReactType;
const Navigation = getComponent('roche-navigation') as React.ReactType;

const loadStoryblokBridge = (onLoadHandler: EventListener): void => {
  const script = DomService.createElement('script', '', {
    src: `//app.storyblok.com/f/storyblok-latest.js?t=${StoryblokService.getConfig().options.accessToken}`,
  });
  script.onload = onLoadHandler;
  document.head.appendChild(script);
};

// eslint-disable-next-line import/no-default-export
export default class StoryblokEntry extends Component<object, StoryblokEntryState> {
  private storyblokClient: StoryblokClient;

  public constructor(props: object) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleStoryblokLoad = this.handleStoryblokLoad.bind(this);
    this.loadStory = this.loadStory.bind(this);

    this.state = {};
  }

  public componentDidMount(): void {
    this.storyblokClient = new StoryblokClient({
      accessToken: StoryblokService.getConfig().options.accessToken as string,
    });
    loadStoryblokBridge(this.handleStoryblokLoad);

    window.addEventListener('rocheLoginComplete', this.handleLogin);
  }

  public render(): JSX.Element {
    const { story, navigation, ...globalConfig } = this.state;

    if (!story) {
      return <div></div>;
    }

    return (
      <StoryblokReact content={story.content}>
        <RocheGlobalConfig {...globalConfig}></RocheGlobalConfig>
        <Navigation tree={navigation} getComponent={getComponent}></Navigation>
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
        const story = data?.story as StoryDataFromGraphQLQuery;

        if (currentStory && currentStory.id === story.id) {
          story.content = storyblok.addComments(story.content, story.id);
          this.setState({ story, ...DomService.getGlobalConfig(story.uuid, story.lang) });
        }
      });

      storyblok.pingEditor(() => {
        if (storyblok.inEditor) {
          storyblok.enterEditmode();
        }
      });
    }
  }

  private handleLogin(): void {
    StoryblokService.redirect(({ story }) => {
      this.setState({ story, ...DomService.getGlobalConfig(story.uuid, story.lang) });
    });
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
          this.setState({ story, ...DomService.getGlobalConfig(story.uuid, story.lang) });
          this.loadGlobalNavigation(story.lang);
        },
      );
    }
  }

  private async loadGlobalNavigation(lang?: string): Promise<void> {
    /* eslint-disable @typescript-eslint/camelcase */
    const queryOptions = {
      ...(lang !== 'default' && { starts_with: `${lang}/*` }),
      resolve_links: 'story',
    };
    /* eslint-enable @typescript-eslint/camelcase */

    const allStories = await this.storyblokClient.getAll('cdn/stories', queryOptions);
    const tree = await NavigationService.getNavigation(allStories);

    this.setState({ navigation: tree });
  }
}
