import React, { Component } from 'react';
import StoryblokReact, { SbEditableContent } from 'storyblok-react';
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
import { RcmIEModal } from '../components/custom/ie-modal';

type StoryblokEntryState = EntryData & { showIEModal: boolean };

const RcmGlobalConfig = getComponent('rcm-global-config') as React.ElementType;
const RcmGlobalContent = getComponent('rcm-global-content') as React.ElementType;
const Navigation = getComponent('rcm-navigation') as React.ElementType;
const Footer = getComponent('rcm-footer') as React.ElementType;
const Container = 'rcm-layout-container' as React.ElementType;

const Article = 'rcm-layout-article' as React.ElementType;
const FundsListPage = 'rcm-layout-funds' as React.ElementType;
const FundsList = 'rcm-funds-list' as React.ElementType;
const FundsDetail = 'rcm-layout-fund' as React.ElementType;
const Articles = 'rcm-layout-articles' as React.ElementType;
const ContactButton = 'rcm-contact-button' as React.ElementType;

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

    this.state = {} as StoryblokEntryState;
  }

  public componentDidMount(): void {
    this.storyblokClient = new StoryblokClient({
      accessToken: StoryblokService.getConfig().options.accessToken as string,
    });
    loadStoryblokBridge(this.handleStoryblokLoad);

    window.addEventListener('rcmLoginComplete', this.handleLogin);

    const ua = window.navigator.userAgent;
    const isIE = ua.indexOf('MSIE ') > 0 || ua.indexOf('Trident/') > 0;
    this.setState({ showIEModal: isIE });

    if (!StoryblokService.getObject()?.isInEditor()) {
      DomService.activateConsentScript();
    }
  }

  /*
   * While editing, mismatches between the "real" DOM and React's virtual DOM might happen.
   * When errors like these occur React DOM unmounts, resulting in a blank page.
   *
   * To minimise editor frustration we handle these using error boundaries.
   *
   * More info:
   * https://reactjs.org/docs/reconciliation.html
   * https://reactjs.org/docs/error-boundaries.html
   */
  static getDerivedStateFromError(): { hasError: true } {
    return { hasError: true };
  }

  public render(): JSX.Element {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong!</h1>
          <p>Your work is not lost, but you will not see any new changes until you save.</p>
          <button
            onClick={(): void => window.location.reload()}
          >
            Refresh editor view
          </button>
        </div>
      );
    }

    const {
      story,
      navigation,
      globalContent,
      articleCategories,
      languages,
      showIEModal,
      articles,
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

    if (story.content.component === 'page') {
      const nestableArticles = story.content.body?.find((item: SbEditableContent) => item.component === 'articles');
      if (nestableArticles) {
        nestableArticles.component = 'rcm-layout-articles';
        nestableArticles.articles = articles;
        nestableArticles.categories = articleCategories;
      }
      const nestableCategoryArticles = story.content.body?.find((item: SbEditableContent) => item.component === 'rcm-category-articles');
      if (nestableCategoryArticles) {
        nestableCategoryArticles.articles = articles;
        nestableCategoryArticles.categories = articleCategories;
      }
    }

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
        <RcmIEModal globalContent={globalContent} show={showIEModal}></RcmIEModal>
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
              slot='content'
              article={JSON.stringify(story.content)}
              related={JSON.stringify(this.state.related)}
              categories={articleCategories}>{
                blokToComponent({ blok: story.content, getComponent })
              }</Article>
          }
          {story.content.component === 'articles'
            && <Articles
              slot='content'
              articles={articles}
              categories={articleCategories}
              dropdown-label={story.content.dropdown_label}
              headline={story.content.headline}
              max-articles-number={story.content.max_articles_number}
              text={story.content.text}
            >
              {blokToComponent({ blok: story.content, getComponent })}
            </Articles>
          }
          {story.content.component === 'funds'
            && <FundsListPage slot='content' {...grabFundsProps(story.content)}>
              {/* These are componentd filled with dummy data */}
              <FundsList
                error-message={story.content.error_message}
                search-label={story.content.search_label}
                search-placeholder={story.content.search_placeholder}
              />
              {
                blokToComponent({ blok: story.content, getComponent })
              }</FundsListPage>
          }
          {story.content.component === 'fund'
            && <FundsDetail slot='content' {...grabFundsProps(story.content)}>
              {/* These are componentd filled with dummy data */}
              {
                blokToComponent({ blok: story.content, getComponent })
              }</FundsDetail>
          }
          {story.content.component !== 'article' && <div slot='content'>{blokToComponent({ blok: story.content, getComponent })}</div>}

        </Container>
        <ContactButton
          link={globalContent?.contact?.button?.link}
          name={globalContent?.contact?.button?.name}>
        </ContactButton>
        <Footer
          tree={navigation}
          getComponent={getComponent}
        ></Footer>
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
          let articles = null;

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

          const articleCategories = await this.storyblokClient.get('cdn/stories', {
            // eslint-disable-next-line @typescript-eslint/camelcase
            starts_with: StoryblokService.getCountryCode(story).countryCode,
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

              return {
                name: category.name, link: '#', count, uuid: category.uuid, image: category.content.image_src, description: category.content.description,
              };
            }));

          const fetchedArticles = await this.storyblokClient.get('cdn/stories', {
            // eslint-disable-next-line @typescript-eslint/camelcase
            starts_with: StoryblokService.getCountryCode(story).countryCode,
            // eslint-disable-next-line @typescript-eslint/camelcase
            filter_query: {
              component: {
                in: 'article',
              },
            },
          });
          if (fetchedArticles) {
            articles = await Promise.all(fetchedArticles.data.stories
              .map(async (article) => ({ ...article })));
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
            articles: JSON.stringify(articles),
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
