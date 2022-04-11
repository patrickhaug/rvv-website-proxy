import React, { Component } from 'react';
import StoryblokReact, { SbEditableContent } from 'storyblok-react';
import StoryblokClient, { Story } from 'storyblok-js-client';
import { getComponent, blokToComponent } from '../components';
import {
  DomService, StoryblokService, NavigationService,
  LanguageService, StoryblokDatasourceEntry, calculateReadingTime,
} from '../services';
import { EntryData, StoryDataFromGraphQLQuery } from '../templates/default';
import { RcmCountrySwitchModal } from '../components/custom/country-switch-modal';
import { RcmUserSwitchModal } from '../components/custom/user-switch-modal';
import { GoogleTagManager } from '../components/custom/google-tag-manager';
import { RcmIEModal } from '../components/custom/ie-modal';
import { markupFromRichtextField } from '../components/custom/richtext';

type StoryblokEntryState = EntryData & { showIEModal: boolean };

const RcmGlobalConfig = getComponent('rcm-global-config') as React.ElementType;
const RcmGlobalContent = getComponent('rcm-global-content') as React.ElementType;
const Navigation = getComponent('rcm-navigation') as React.ElementType;
const Footer = getComponent('rcm-footer') as React.ElementType;
const Container = 'rcm-layout-container' as React.ElementType;

const Article = 'rcm-layout-article' as React.ElementType;
const FundsListPage = 'rcm-layout-funds' as React.ElementType;
const FundsDetail = 'rcm-layout-fund' as React.ElementType;
const Articles = 'rcm-layout-articles' as React.ElementType;
const ContactButton = 'rcm-contact-button' as React.ElementType;
const DedicatedContainer = 'rcm-dedicated-container' as React.ElementType;
const FundsPrices = 'rcm-layout-fundsprices' as React.ElementType;
const FundsDocuments = 'rcm-layout-fundsdownloads' as React.ElementType;
const FundFusion = 'rcm-layout-fundsfusions' as React.ElementType;
const FundsMandatory = 'rcm-layout-fundsmandatory' as React.ElementType;
const Disclaimer = 'rcm-disclaimer-container' as React.ElementType;
const RcmNavigationSalzburg = 'rcm-navigation-salzburg' as React.ElementType;

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

    const {
      story, navigation, globalContent, showIEModal, ...globalConfig
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
        Object.entries(rest).map(([key, value]) => [
          key.replace(/_/g, '-'),
          typeof value === 'object' ? JSON.stringify(value) : value,
        ]),
      );
      return moddedObj;
    };

    if (story.content.component === 'page') {
      const nestableArticles = story.content.body?.find(
        (item: SbEditableContent) => item.component === 'articles'
      );
      if (nestableArticles) {
        nestableArticles.component = 'rcm-layout-articles';
      }
    }

    const getIntro = (intro: any) => (intro ? React.createElement(
      'rcm-richtext',
      {
        // eslint-disable-next-line no-underscore-dangle
        slot: 'intro',
        'capitalize-first-Letter': undefined,
        'right-to-left': undefined,
        level: 1,
        width: 'full',
        'no-margin': true,
        dangerouslySetInnerHTML: {
          __html: markupFromRichtextField(intro),
        },
      },
    ) : '');

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
          userTypeFromSlug={StoryblokService.getUserTypeFromSlug(story)}
          globalContent={globalContent}
          country={globalConfig.country}
          inArticle={story.content.component === 'article'}
        ></RcmUserSwitchModal>
        <RcmIEModal
          globalContent={globalContent}
          show={showIEModal}
        ></RcmIEModal>
        <RcmGlobalConfig {...globalConfig}></RcmGlobalConfig>
        <RcmGlobalContent
          globalContent={JSON.stringify(globalContent)}
        ></RcmGlobalContent>
        {globalConfig.locale === 'salzburg'
          ? <RcmNavigationSalzburg>
          </RcmNavigationSalzburg>
          : <Navigation
            tree={navigation}
            getComponent={getComponent}
            userTypeFromSlug={StoryblokService.getUserTypeFromSlug(story)}
            countryCode={StoryblokService.getCountryCode(story).countryCode}
            currentCountry={StoryblokService.getCountryCode(story).country}
            currentLanguage={StoryblokService.getCountryCode(story).locale}
            alternates={JSON.stringify(story.alternates)}
          ></Navigation>}
        <Container
          kind={`${globalConfig.locale === 'salzburg' ? 'full' : 'normal'}`}
        >
          {story.content.component === 'article' && (
            <Article
              slot='content'
              article={JSON.stringify({
                ...story.content,
                readingTime: calculateReadingTime(story),
              })}
              story-uuid={story.uuid}
              country={StoryblokService.getCountryCode(story).country}
              language={StoryblokService.getCountryCode(story).locale}
            >
              {blokToComponent({ blok: story.content, getComponent })}
            </Article>
          )}
          {story.content.component === 'articles' && (
            <Articles
              slot='content'
              dropdown-label={story.content.dropdown_label}
              all-categories-label={story.content.all_categories_label}
              headline={story.content.headline}
              max-articles-number={story.content.max_articles_number}
              text={story.content.text}
            >
              {blokToComponent({ blok: story.content, getComponent })}
            </Articles>
          )}
          {story.content.component === 'funds' && (
            <FundsListPage slot='content' {...grabFundsProps(story.content)}>
              {blokToComponent({ blok: story.content, getComponent })}
            </FundsListPage>
          )}
          {story.content.component !== 'article' && (
            <div slot='content'>
              {blokToComponent({ blok: story.content, getComponent })}
            </div>
          )}
          {story.content.component === 'fund-detail' && (
            <FundsDetail slot='content'>
              {blokToComponent({ blok: story.content, getComponent })}
            </FundsDetail>
          )}
          {story.content.component === 'courses-and-documents' && (
            <DedicatedContainer slot='content'>
              {story.content.body.map((c) => blokToComponent({ blok: c, getComponent }))}
            </DedicatedContainer>
          )}
          {story.content.component === 'courses-and-documents' && (
            <DedicatedContainer slot='content'>
              {story.content.body.map((c) => blokToComponent({ blok: c, getComponent }))}
            </DedicatedContainer>
          )}
          {story.content.component === 'funds-prices' && (
            <DedicatedContainer slot='content'>
              <FundsPrices
                headline={story.content.headline}
                input-placeholder={story.content.input_placeholder}
              >
                {getIntro(story.content.intro)}
              </FundsPrices>
            </DedicatedContainer>
          )}
          {story.content.component === 'funds-documents' && (
            <DedicatedContainer slot='content'>
              <FundsDocuments
                headline={story.content.headline}
                input-placeholder={story.content.input_placeholder}
              >
                {getIntro(story.content.intro)}
              </FundsDocuments>
            </DedicatedContainer>
          )}
          {story.content.component === 'fund-fusion' && (
            <DedicatedContainer slot='content'>
              <FundFusion
                headline={story.content.headline}
                input-placeholder={story.content.input_placeholder}
                no-funds-found-text={story.content.no_funds_found_text}
                no-funds-found-headline={story.content.no_funds_found_headline}
              >
                {getIntro(story.content.intro)}
              </FundFusion>
            </DedicatedContainer>
          )}
          {story.content.component === 'funds-mandatory' && (
            <DedicatedContainer slot='content'>
              <FundsMandatory
                headline={story.content.headline}
                input-placeholder={story.content.input_placeholder}
              >
                {getIntro(story.content.intro)}
              </FundsMandatory>
            </DedicatedContainer>
          )}
          {story.content.component !== 'article' && (
            <div slot='content'>
              {blokToComponent({ blok: story.content, getComponent })}
              {story.content.disclaimer_type?.length > 0 && (
                <Disclaimer
                  disclaimer={JSON.stringify(story.content.disclaimer_type)}
                ></Disclaimer>
              )}
            </div>
          )}
        </Container>
        <ContactButton
          link={globalContent?.contact?.button?.link}
          name={globalContent?.contact?.button?.name}
        ></ContactButton>
        <Footer
          tree={navigation}
          getComponent={getComponent}
          userTypeFromSlug={StoryblokService.getUserTypeFromSlug(story)}
          countryCode={StoryblokService.getCountryCode(story).countryCode}
          isSalzburg={globalConfig.locale === 'salzburg'}
        ></Footer>
        {/* End Google Tag Manager (noscript) */}
        {/* TODO: Remove GTM from editor view after tracking was tested by Oli */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${globalContent?.gtmId}`}
            height='0'
            width='0'
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
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
              story.id,
            );

            this.setState({
              story: copyStoryWithResolvedRelations,
              ...DomService.getGlobalConfig(
                copyStoryWithResolvedRelations.uuid,
                StoryblokService.getCountryCode(copyStoryWithResolvedRelations)
                  .locale,
                StoryblokService.getCountryCode(copyStoryWithResolvedRelations)
                  .country,
              ),
            });
          },
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
          StoryblokService.getCountryCode(story).country,
        ),
      });
    });
  }

  async loadStory(): Promise<void> {
    const storyblok = StoryblokService.getObject();
    const storyblokConfig = StoryblokService.getConfig();
    const timeStamp = new Date().toString();
    const defaultDatasourceEntries: StoryblokDatasourceEntry[] = await this.storyblokClient.getAll('cdn/datasource_entries', {
      cv: timeStamp,
      per_page: 1000,
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
          const storyblokDatasourceEntries: StoryblokDatasourceEntry[] = await this.storyblokClient.getAll('cdn/datasource_entries', {
            cv: timeStamp,
            dimension: StoryblokService.getCountryCode(story).countryCode,
            per_page: 1000,
          });
          const globalContentEntries = StoryblokService.parseDatasourceEntries(
            StoryblokService.getLocalizedDatasourceEntries({
              datasourceEntries: [storyblokDatasourceEntries],
              // for the editor view we load only the datasources for this country
              dimensions: [StoryblokService.getCountryCode(story).countryCode],
              countryCode: StoryblokService.getCountryCode(story).countryCode,
              defaultValue: defaultDatasourceEntries,
            }),
          );
          this.setState({
            story,
            ...DomService.getGlobalConfig(
              story.uuid,
              StoryblokService.getCountryCode(story).locale,
              StoryblokService.getCountryCode(story).country,
            ),
            globalContent: globalContentEntries,
          });
          this.loadNavigation(story.lang);
          this.loadLanguages();
        },
      );
    }
  }

  private async loadNavigation(lang?: string): Promise<void> {
    const queryOptions = {
      ...(lang !== 'default' && { starts_with: `${lang}/*` }),
    };

    const allStories = await this.storyblokClient.getAll(
      'cdn/stories',
      queryOptions,
    );
    const tree = await NavigationService.getNavigation(allStories, lang);
    const contact = await NavigationService.getContactPage(lang);

    this.setState({ navigation: tree, contact });
  }

  private async loadLanguages(): Promise<void> {
    const languages = await LanguageService.getLanguages();
    this.setState({ languages });
  }
}
