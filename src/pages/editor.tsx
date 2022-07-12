import React, { Component } from 'react';
import StoryblokReact, { SbEditableContent } from 'storyblok-react';
import StoryblokClient, { Story } from 'storyblok-js-client';
import { getComponent, blokToComponent } from '../components';
import {
  DomService, StoryblokService, NavigationService, StoryblokDatasourceEntry, calculateReadingTime,
} from '../services';
import { EntryData, StoryDataFromGraphQLQuery } from '../templates/default';
import { SEO } from '../components/custom/seo';

// import { rvvCountrySwitchModal } from '../components/custom/country-switch-modal';
// import { rvvUserSwitchModal } from '../components/custom/user-switch-modal';
// import { GoogleTagManager } from '../components/custom/google-tag-manager';
// import { rvvIEModal } from '../components/custom/ie-modal';
// import { markupFromRichtextField } from '../components/custom/richtext';

type StoryblokEntryState = EntryData & { showIEModal: boolean };

const RvvGlobalConfig = getComponent('rvv-global-config') as React.ElementType;
const RvvGlobalContent = getComponent(
  'rvv-global-content'
) as React.ElementType;
const Navigation = getComponent('rvv-navigation') as React.ElementType;
const Footer = getComponent('rvv-footer') as React.ElementType;
const Container = 'rvv-layout-container' as React.ElementType;

const loadStoryblokBridge = (onLoadHandler: EventListener): void => {
  const script = DomService.createElement('script', '', {
    src: `//app.storyblok.com/f/storyblok-latest.js?t=${
      StoryblokService.getConfig().options.accessToken
    }`,
  });
  script.onload = onLoadHandler;
  document.head.appendChild(script);
};

// eslint-disable-next-line import/no-default-export
export default class StoryblokEntry extends Component<
  Record<string, unknown>,
  StoryblokEntryState
> {
  private storyblokClient: StoryblokClient;

  public constructor(props: Record<string, unknown>) {
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

    window.addEventListener('rvvLoginComplete', this.handleLogin);

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
          <p>
            Your work is not lost, but you will not see any new changes until
            you save.
          </p>
          <button onClick={(): void => window.location.reload()}>
            Refresh editor view
          </button>
        </div>
      );
    }

    const { story, navigation, globalContent, showIEModal, ...globalConfig } =
      this.state;

    if (!story || !story.content) {
      return <div></div>;
    }

    if (story.content.component === 'page') {
      const nestableArticles = story.content.body?.find(
        (item: SbEditableContent) => item.component === 'articles'
      );
      if (nestableArticles) {
        nestableArticles.component = 'rvv-layout-articles';
      }
    }

    // const getIntro = (intro: any) => (intro ? React.createElement(
    //   'rvv-richtext',
    //   {
    //     // eslint-disable-next-line no-underscore-dangle
    //     slot: 'intro',
    //     'capitalize-first-Letter': undefined,
    //     'right-to-left': undefined,
    //     level: 1,
    //     width: 'full',
    //     'no-margin': true,
    //     dangerouslySetInnerHTML: {
    //       __html: markupFromRichtextField(intro),
    //     },
    //   },
    // ) : '');

    return (
      <StoryblokReact content={story.content}>
        <>
          <SEO
            {...story.content.meta_tags}
            lang={StoryblokService.getCountryCode(story).locale}
            slug={story.full_slug}
            authorized_roles={story.content.authorized_roles}
          ></SEO>
          <RvvGlobalConfig {...globalConfig}></RvvGlobalConfig>
          <RvvGlobalContent
            globalContent={JSON.stringify(globalContent)}
          ></RvvGlobalContent>
          <Navigation
            tree={navigation}
            getComponent={getComponent}
            countryCode={StoryblokService.getCountryCode(story).countryCode}
            currentCountry={StoryblokService.getCountryCode(story).country}
            currentLanguage={StoryblokService.getCountryCode(story).locale}
            alternates={JSON.stringify(story.alternates)}
          ></Navigation>
          <Container kind='normal'>
            <div slot='content'>
              {blokToComponent({ blok: story.content, getComponent })}
            </div>
          </Container>
          <ContactButton
            link={globalContent?.contact?.button?.link}
            name={globalContent?.contact?.button?.name}
          ></ContactButton>
          <Footer
            tree={navigation}
            getComponent={getComponent}
            countryCode={StoryblokService.getCountryCode(story).countryCode}
          ></Footer>
        </>
      </StoryblokReact>
    );
  }

  private handleStoryblokLoad(): void {
    this.loadStory();
    const storyblok = StoryblokService.getObject();
    const storyblokConfig = StoryblokService.getConfig();

    if (storyblok) {
      storyblok.on(['change', 'published'], this.loadStory);

      storyblok.on('input', (data: Story['data']) => {
        const story = data?.story as StoryDataFromGraphQLQuery;

        storyblok.resolveRelations(
          story,
          storyblokConfig.options.resolveRelations,
          (storyWithResolvedRelations) => {
            const copyStoryWithResolvedRelations = {
              ...storyWithResolvedRelations,
            };
            copyStoryWithResolvedRelations.content = storyblok.addComments(
              story.content,
              story.id
            );

            this.setState({
              story: copyStoryWithResolvedRelations,
              ...DomService.getGlobalConfig(
                copyStoryWithResolvedRelations.uuid,
                StoryblokService.getCountryCode(copyStoryWithResolvedRelations)
                  .locale,
                StoryblokService.getCountryCode(copyStoryWithResolvedRelations)
                  .country
              ),
            });
          }
        );
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
        ...DomService.getGlobalConfig(
          story.uuid,
          StoryblokService.getCountryCode(story).locale,
          StoryblokService.getCountryCode(story).country
        ),
      });
    });
  }

  async loadStory(): Promise<void> {
    const storyblok = StoryblokService.getObject();
    const storyblokConfig = StoryblokService.getConfig();
    const timeStamp = new Date().toString();
    const defaultDatasourceEntries: StoryblokDatasourceEntry[] =
      await this.storyblokClient.getAll('cdn/datasource_entries', {
        cv: timeStamp,
        per_page: 500,
      });
    if (storyblok && storyblokConfig) {
      const currentPath = storyblok.getParam('path');
      storyblok.get(
        {
          slug: currentPath === '/' ? '/home' : currentPath,
          version: 'draft',
          resolve_relations: storyblokConfig.options.resolveRelations || [],
        },
        async ({ story }) => {
          const storyblokDatasourceEntries: StoryblokDatasourceEntry[] =
            await this.storyblokClient.getAll('cdn/datasource_entries', {
              cv: timeStamp,
              dimension: StoryblokService.getCountryCode(story).countryCode,
              per_page: 500,
            });
          const globalContentEntries = StoryblokService.parseDatasourceEntries(
            StoryblokService.getLocalizedDatasourceEntries({
              datasourceEntries: [storyblokDatasourceEntries],
              // for the editor view we load only the datasources for this country
              dimensions: [StoryblokService.getCountryCode(story).countryCode],
              countryCode: StoryblokService.getCountryCode(story).countryCode,
              defaultValue: defaultDatasourceEntries,
            })
          );
          this.setState({
            story,
            ...DomService.getGlobalConfig(
              story.uuid,
              StoryblokService.getCountryCode(story).locale,
              StoryblokService.getCountryCode(story).country
            ),
            globalContent: globalContentEntries,
          });
          this.loadNavigation(story.lang);
        }
      );
    }
  }

  private async loadNavigation(lang?: string): Promise<void> {
    const allStories = await this.storyblokClient.getAll('cdn/stories', {
      excluding_slugs: '*/global/*, */category/*, */article/*',
    });
    const tree = await NavigationService.getNavigation(allStories, lang);

    this.setState({ navigation: tree });
  }
}
