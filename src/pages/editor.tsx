import React, { Component } from 'react';
import StoryblokReact from 'storyblok-react';
import StoryblokClient, { Story } from 'storyblok-js-client';
import { getComponent, blokToComponent } from '../components';
import {
  DomService, StoryblokService, NavigationService, LanguageService,
} from '../services';
import { EntryData, StoryDataFromGraphQLQuery } from '../templates/default';

type StoryblokEntryState = EntryData;

const RcmGlobalConfig = getComponent('rcm-global-config') as React.ElementType;
const Header = 'rcm-header' as React.ElementType;
// const OffCanvas = 'rcm-offcanvas-panel' as React.ElementType;
const Navigation = getComponent('rcm-navigation') as React.ElementType;
// const Search = 'rcm-search' as React.ElementType;

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

    this.state = {} as EntryData;
  }

  public componentDidMount(): void {
    this.storyblokClient = new StoryblokClient({
      accessToken: StoryblokService.getConfig().options.accessToken as string,
    });
    loadStoryblokBridge(this.handleStoryblokLoad);

    window.addEventListener('rcmLoginComplete', this.handleLogin);
  }

  public render(): JSX.Element {
    const {
      story,
      navigation,
      // contact,
      breadcrumbs,
      footer,
      onClickNotice,
      search,
      languages,
      ...globalConfig
    } = this.state;

    if (!story || !story.content) {
      return <div></div>;
    }

    return (
      <StoryblokReact content={story.content}>
        <RcmGlobalConfig {...globalConfig}></RcmGlobalConfig>
        <Navigation
          tree={navigation}
          getComponent={getComponent}
          languages={languages}
        ></Navigation>
        <Header
          breadcrumbs={JSON.stringify(breadcrumbs)}
          languages={JSON.stringify(languages)}
        />
        {story.content.component === 'article'
          && <rcm-layout-article article={JSON.stringify(story.content)}>{
            blokToComponent({ blok: story.content, getComponent })
          }</rcm-layout-article>
        }
        {story.content.component !== 'article' && blokToComponent({ blok: story.content, getComponent })}
        {footer && blokToComponent({ blok: footer?.content, getComponent })}
        {onClickNotice && blokToComponent({ blok: onClickNotice.content, getComponent })}
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
          this.loadNavigation(story.lang);
          this.loadFooter(story.lang);
          this.loadOnclickNotice(story.lang);
          this.loadLanguages();
          this.loadSearch(story.lang);
        },
      );
    }
  }

  private async loadNavigation(lang?: string): Promise<void> {
    /* eslint-disable @typescript-eslint/camelcase */
    const queryOptions = {
      ...(lang !== 'default' && { starts_with: `${lang}/*` }),
    };
    /* eslint-enable @typescript-eslint/camelcase */

    const allStories = await this.storyblokClient.getAll('cdn/stories', queryOptions);
    const tree = await NavigationService.getNavigation(allStories, lang);
    const breadcrumbs = NavigationService.getBreadcrumbs(this.state.story.uuid, tree);
    const contact = await NavigationService.getContactPage(lang);

    this.setState({ navigation: tree, breadcrumbs, contact });
  }

  private async loadFooter(lang?: string): Promise<void> {
    const slugWithLang = lang !== 'default' ? `/${lang}/footer` : 'footer';
    const { data } = await this.storyblokClient.getStory(slugWithLang);
    this.setState({ footer: data.story });
  }

  private async loadSearch(lang?: string): Promise<void> {
    const slugWithLang = lang !== 'default' ? `/${lang}/search` : 'search';
    const { data } = await this.storyblokClient.getStory(slugWithLang);
    this.setState({ search: data.story });
  }

  private async loadOnclickNotice(lang?: string): Promise<void> {
    const slugWithLang = lang !== 'default' ? `/${lang}/on-click-notice` : 'on-click-notice';
    const { data } = await this.storyblokClient.getStory(slugWithLang);
    this.setState({ onClickNotice: data.story });
  }

  private async loadLanguages(): Promise<void> {
    const languages = await LanguageService.getLanguages();
    this.setState({ languages });
  }
}
