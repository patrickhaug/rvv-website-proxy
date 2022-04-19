import React, { Component } from 'react';
import StoryblokReact, { SbEditableContent } from 'storyblok-react';
import StoryblokClient, { Story } from 'storyblok-js-client';
import { getComponent } from '../../components';
import {
  DomService,
  StoryblokService,
  NavigationService,
  StoryblokDatasourceEntry,
  Country,
} from '../../services';
import { EntryData, StoryDataFromGraphQLQuery } from '../../templates/default';
import { RcmCountrySwitchModal } from '../../components/custom/country-switch-modal';
import { RcmUserSwitchModal } from '../../components/custom/user-switch-modal';
import { GoogleTagManager } from '../../components/custom/google-tag-manager';
import { RcmIEModal } from '../../components/custom/ie-modal';

type StoryblokEntryState = EntryData & { showIEModal: boolean };

const RcmGlobalConfig = getComponent('rcm-global-config') as React.ElementType;
const RcmGlobalContent = getComponent(
  'rcm-global-content',
) as React.ElementType;
const Navigation = getComponent('rcm-navigation') as React.ElementType;
const Footer = getComponent('rcm-footer') as React.ElementType;
const Container = 'rcm-layout-container' as React.ElementType;

const FundsDetail = 'rcm-layout-fund' as React.ElementType;
const ContactButton = 'rcm-contact-button' as React.ElementType;

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

    const countryCode = window.location.pathname.split('/')[1];

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
          country={countryCode.split('-')[0] as Country}
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
        {globalConfig.locale !== 'salzburg' && (
          <Navigation
            tree={navigation}
            getComponent={getComponent}
            userTypeFromSlug={StoryblokService.getUserTypeFromSlug(story)}
            countryCode={StoryblokService.getCountryCode(story).countryCode}
            currentCountry={StoryblokService.getCountryCode(story).country}
            currentLanguage={StoryblokService.getCountryCode(story).locale}
            alternates={JSON.stringify(story.alternates)}
          ></Navigation>
        )}
        <Container
          kind={`${globalConfig.locale === 'salzburg' ? 'full' : 'normal'}`}
        >
          <FundsDetail slot='content'></FundsDetail>
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

    const countryCode = window.location.pathname.split('/')[1];
    const defaultDatasourceEntries: StoryblokDatasourceEntry[] = await this.storyblokClient.getAll('cdn/datasource_entries', {
      cv: timeStamp,
      per_page: 500,
    });
    if (storyblok && storyblokConfig) {
      storyblok.get(
        {
          slug: `${countryCode}/global/fund`,
          version: 'published',
        },
        async ({ story }) => {
          const storyblokDatasourceEntries: StoryblokDatasourceEntry[] = await this.storyblokClient.getAll('cdn/datasource_entries', {
            cv: timeStamp,
            dimension: countryCode,
            per_page: 500,
          });
          const globalContentEntries = StoryblokService.parseDatasourceEntries(
            StoryblokService.getLocalizedDatasourceEntries({
              datasourceEntries: [storyblokDatasourceEntries],
              // for the editor view we load only the datasources for this country
              dimensions: [countryCode],
              countryCode,
              defaultValue: defaultDatasourceEntries,
            }),
          );
          this.setState({
            story,
            ...DomService.getGlobalConfig(
              story.uuid,
              countryCode.split('-')[1],
              countryCode.split('-')[0],
            ),
            globalContent: globalContentEntries,
          });
          this.loadNavigation(countryCode.split('-')[0]);
        },
      );
    }
  }

  private async loadNavigation(lang?: string): Promise<void> {
    const countryCode = window.location.pathname.split('/')[1];

    const queryOptions = {
      ...(lang !== 'default' && { starts_with: `${lang}/*` }),
      excluding_slugs: '*/global/*, */category/*, */article/*',
    };

    const allStories = await this.storyblokClient.getAll(
      'cdn/stories',
      queryOptions,
    );
    const tree = await NavigationService.getNavigation(
      allStories,
      countryCode.split('-')[1],
    );

    this.setState({ navigation: tree });
  }
}
