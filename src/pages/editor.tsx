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
const RcmGlobalContent = getComponent('rcm-global-content') as React.ElementType;
const Header = 'rcm-header' as React.ElementType;
// const OffCanvas = 'rcm-offcanvas-panel' as React.ElementType;
const Navigation = getComponent('rcm-navigation') as React.ElementType;
// const Search = 'rcm-search' as React.ElementType;
const Container = 'rcm-layout-container' as React.ElementType;

const Article = 'rcm-layout-article' as React.ElementType;
const FundsListPage = 'rcm-layout-funds' as React.ElementType;
const FundsList = 'rcm-fonds-list' as React.ElementType;
const FundsDetail = 'rcm-layout-fund' as React.ElementType;

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
      breadcrumbs,
      globalContent,
      articleCategories,
      languages,
      ...globalConfig
    } = this.state;

    if (!story || !story.content) {
      return <div></div>;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const grabFundsProps = (obj) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { body, ...rest } = obj;
      rest.background = rest.background.filename;
      const moddedObj = Object.fromEntries(
        Object.entries(rest).map(([key, value]) => [key.replace(/_/g, '-'), value]),
      );
      return moddedObj;
    };

    return (
      <StoryblokReact content={story.content}>
        <RcmGlobalConfig {...globalConfig}></RcmGlobalConfig>
        <RcmGlobalContent globalContent={globalContent}></RcmGlobalContent>
        <Navigation
          tree={navigation}
          getComponent={getComponent}
          languages={languages}
        ></Navigation>
        <Header
          breadcrumbs={JSON.stringify(breadcrumbs)}
          languages={JSON.stringify(languages)}
        />
        <Container>
          {story.content.component === 'article'
            && <Article
              article={JSON.stringify(story.content)}
              related={JSON.stringify(this.state.related)}
              categories={articleCategories}>{
                blokToComponent({ blok: story.content, getComponent })
              }</Article>
          }
          {story.content.component === 'funds'
            && <FundsListPage {...grabFundsProps(story.content)}>
              {/* These are componentd filled with dummy data */}
              <FundsList />
              {
                blokToComponent({ blok: story.content, getComponent })
              }</FundsListPage>
          }
          {story.content.component === 'fund'
            && <FundsDetail {...grabFundsProps(story.content)}>
              {/* These are componentd filled with dummy data */}
              {
                blokToComponent({ blok: story.content, getComponent })
              }</FundsDetail>
          }
          {story.content.component !== 'article' && blokToComponent({ blok: story.content, getComponent })}
        </Container>
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

  async loadStory(): Promise<void> {
    const storyblok = StoryblokService.getObject();
    const storyblokConfig = StoryblokService.getConfig();
    const storyblokDatasourceEntries = await this.storyblokClient.get('cdn/datasource_entries');
    const globalContentEntries = await StoryblokService
      .parseDatasourceEntries(storyblokDatasourceEntries.data);
    const articleCategories = await this.storyblokClient.get('cdn/stories', {
      // eslint-disable-next-line @typescript-eslint/camelcase
      filter_query: {
        component: {
          in: 'category',
        },
      },
    });
    // eslint-disable-next-line compat/compat
    const articleCategorieTabs = await Promise.all(articleCategories.data.stories
      .map(async (category) => {
        const articlesInCategory = await this.storyblokClient.get('cdn/stories', {
        // eslint-disable-next-line @typescript-eslint/camelcase
          filter_query: {
            category: {
              exists: category.uuid,
            },
          },
        });
        const count = articlesInCategory.data.stories.length;
        return { name: category.name, link: '#', count };
      }));
    if (storyblok && storyblokConfig) {
      const currentPath = storyblok.getParam('path');
      storyblok.get(
        {
          slug: currentPath === '/' ? '/home' : currentPath,
          version: 'draft',
          // eslint-disable-next-line @typescript-eslint/camelcase
          resolve_relations: storyblokConfig.options.resolveRelations || [],
        },
        async ({ story }) => {
          let relatedArticles = null;

          if (story.content && story.content.category) {
            const data = await this.storyblokClient.get('cdn/stories', {
              // eslint-disable-next-line @typescript-eslint/camelcase
              filter_query: {
                category: {
                  exists: story.content.category.map((c) => c.uuid).join(','),
                },
              },
            });
            if (data) {
              relatedArticles = data.data.stories.filter((e) => e.uuid !== story.uuid);
            }
          }
          this.setState({
            story,
            ...DomService.getGlobalConfig(story.uuid, story.lang),
            related: relatedArticles,
            globalContent: JSON.stringify(globalContentEntries),
            articleCategories: JSON.stringify(articleCategorieTabs),
          });
          this.loadNavigation(story.lang);
          this.loadLanguages();
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

  private async loadLanguages(): Promise<void> {
    const languages = await LanguageService.getLanguages();
    this.setState({ languages });
  }
}
