import React, { Component } from 'react';
import StoryblokReact from 'storyblok-react';
import StoryblokClient, { Story } from 'storyblok-js-client';
import { getComponent, blokToComponent } from '../components';
import {
  DomService, StoryblokService, NavigationService,
  LanguageService, StoryblokDatasource, StoryblokDatasourceEntry,
} from '../services';
import { EntryData, StoryDataFromGraphQLQuery } from '../templates/default';
import { RcmCountrySwitchModal } from '../components/custom/country-switch-modal';
import { RcmUserSwitchModal } from '../components/custom/user-switch-modal';
import { GoogleTagManager } from '../components/custom/google-tag-manager';

type StoryblokEntryState = EntryData;

const RcmGlobalConfig = getComponent('rcm-global-config') as React.ElementType;
const RcmGlobalContent = getComponent('rcm-global-content') as React.ElementType;
const Navigation = getComponent('rcm-navigation') as React.ElementType;
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
        {/* TODO: Remove GTM from editor view after tracking was tested by Oli */}
        <GoogleTagManager
          googleTagManagerId={globalContent?.gtmId}
        ></GoogleTagManager>
        <RcmCountrySwitchModal
          globalContent={globalContent}
        ></RcmCountrySwitchModal>
        <RcmUserSwitchModal
          globalContent={globalContent}
          country={globalConfig.country}
          inArticle={story.content.component === 'article'}
        ></RcmUserSwitchModal>
        <RcmGlobalConfig {...globalConfig}></RcmGlobalConfig>
        <RcmGlobalContent globalContent={JSON.stringify(globalContent)}></RcmGlobalContent>
        <Navigation
          tree={navigation}
          getComponent={getComponent}
          languages={languages}
        ></Navigation>
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
        {/* End Google Tag Manager (noscript) */}
        {/* TODO: Remove GTM from editor view after tracking was tested by Oli */}
        <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${globalContent?.gtmId}`}
          height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe></noscript>
        {/* End Google Tag Manager (noscript) */}
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
          this.setState({
            story,
            ...DomService.getGlobalConfig(story.uuid,
              StoryblokService.getCountryCode(story).locale,
              StoryblokService.getCountryCode(story).country),
          });
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
      this.setState({
        story,
        ...DomService.getGlobalConfig(story.uuid, StoryblokService.getCountryCode(story).locale,
          StoryblokService.getCountryCode(story).country),
      });
    });
  }

  async loadStory(): Promise<void> {
    const storyblok = StoryblokService.getObject();
    const storyblokConfig = StoryblokService.getConfig();
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
    const timeStamp = new Date().toString();
    const storyblokDatasources: StoryblokDatasource[] = await this.storyblokClient.getAll('cdn/datasources', {
      cv: timeStamp,
    });
    const storyblokDatasourceDimensions: string[] = storyblokDatasources.map(
      (datasource) => datasource.dimensions.map((dimension) => dimension.entry_value),
    ).flat().filter(
      (dimension, index, allDimensions) => allDimensions.indexOf(dimension) === index,
    );
    const defaultDatasourceEntries: StoryblokDatasourceEntry[] = await this.storyblokClient.getAll('cdn/datasource_entries', {
      cv: timeStamp,
    });
    const storyblokDatasourceEntriesPromises: Promise<StoryblokDatasourceEntry[]>[] = storyblokDatasourceDimensions.map(async (dimension) => this.storyblokClient.getAll('cdn/datasource_entries', {
      cv: timeStamp,
      dimension,
    }) as unknown as Promise<StoryblokDatasourceEntry[]>);
    // eslint-disable-next-line compat/compat
    const storyblokDatasourceEntries = await Promise.all(storyblokDatasourceEntriesPromises);
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
          const globalContentEntries = StoryblokService
            .parseDatasourceEntries(StoryblokService.getLocalizedDatasourceEntries(
              {
                datasourceEntries: storyblokDatasourceEntries,
                dimensions: storyblokDatasourceDimensions,
                countryCode: StoryblokService.getCountryCode(story).countryCode,
                defaultValue: defaultDatasourceEntries,
              },
            ));
          this.setState({
            story,
            ...DomService.getGlobalConfig(story.uuid,
              StoryblokService.getCountryCode(story).locale,
              StoryblokService.getCountryCode(story).country),
            related: relatedArticles,
            globalContent: globalContentEntries,
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
    const contact = await NavigationService.getContactPage(lang);

    this.setState({ navigation: tree, contact });
  }

  private async loadLanguages(): Promise<void> {
    const languages = await LanguageService.getLanguages();
    this.setState({ languages });
  }
}
