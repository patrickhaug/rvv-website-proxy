import React, { Component } from 'react';
import { StoryData } from 'storyblok-js-client';
import { SbEditableContent } from 'storyblok-react';
import { getComponent, blokToComponent } from '../components';
import { GoogleTagManager } from '../components/custom/google-tag-manager';
import {
  DomService,
  GlobalConfigProps,
  StoryblokNodeTree,
  StoryblokService,
  NavigationService,
  Language,
  LanguageService,
  GlobalContent,
  calculateReadingTime,
} from '../services';
import { SEO } from '../components/custom/seo';
import { RcmCountrySwitchModal } from '../components/custom/country-switch-modal';
import { RcmUserSwitchModal } from '../components/custom/user-switch-modal';
import { RcmIEModal } from '../components/custom/ie-modal';
import { markupFromRichtextField } from '../components/custom/richtext';

export interface StoryDataFromGraphQLQuery extends StoryData {
  lang: string;
}

export interface EntryData extends GlobalConfigProps {
  story?: StoryDataFromGraphQLQuery;
  navigation?: StoryblokNodeTree[];
  contact?: StoryData;
  languages?: Language[];
  search?: StoryData;
  globalContent?: GlobalContent;
}

interface StoryblokEntryProps {
  pageContext: EntryData;
  location: {
    state?: {
      maskUrl?: string;
    };
  };
}

type StoryblokEntryState = EntryData & { showIEModal: boolean };

const parseEntryData = ({ pageContext }: StoryblokEntryProps): StoryblokEntryState => {
  const story = {
    ...pageContext.story,
  };

  return {
    story,
    showIEModal: false,
    ...DomService.getGlobalConfig(
      story.uuid,
      StoryblokService.getCountryCode(story).locale,
      StoryblokService.getCountryCode(story).country,
    ),
    globalContent: pageContext.globalContent,
  };
};

const RcmGlobalConfig = getComponent('rcm-global-config') as React.ElementType;
const RcmGlobalContent = getComponent('rcm-global-content') as React.ElementType;
const Navigation = getComponent('rcm-navigation') as React.ElementType;
const Footer = getComponent('rcm-footer') as React.ElementType;
const Article = 'rcm-layout-article' as React.ElementType;
const Container = 'rcm-layout-container' as React.ElementType;
const FundsList = 'rcm-layout-funds' as React.ElementType;
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

// eslint-disable-next-line import/no-default-export
export default class StoryblokEntry extends Component<
StoryblokEntryProps,
StoryblokEntryState
> {
  public static getDerivedStateFromProps(
    props: StoryblokEntryProps,
    state: StoryblokEntryState,
  ): StoryblokEntryState {
    return state.story.uuid !== props.pageContext.story.uuid
      ? parseEntryData(props)
      : null;
  }

  public constructor(props: StoryblokEntryProps) {
    super(props);
    this.state = parseEntryData(props);
  }

  public componentDidMount(): void {
    this.maskUrl();
    window.addEventListener('rcmLoginComplete', () => StoryblokService.redirect());

    /** fetch is polyfilled */
    // eslint-disable-next-line compat/compat
    fetch(`/navigation-data-${this.state.story.lang}.json`)
      .then((res) => res.json())
      .then((navigationData) => {
        this.setState({ navigation: navigationData });
      });

    NavigationService.getContactPage(this.state.story.lang).then(
      (contactPage) => this.setState({ contact: contactPage }),
    );

    LanguageService.getLanguages().then((languages) => this.setState({ languages }));

    DomService.activateConsentScript();

    const ua = window.navigator.userAgent;
    const isIE = ua.indexOf('MSIE ') > 0 || ua.indexOf('Trident/') > 0;
    this.setState({ showIEModal: isIE });
  }

  public render(): JSX.Element {
    const {
      story, navigation, globalContent, showIEModal, ...globalConfig
    } = this.state;

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
      <>
        <GoogleTagManager
          googleTagManagerId={globalContent?.gtmId}
        ></GoogleTagManager>
        <SEO
          {...story.content.meta_tags}
          lang={StoryblokService.getCountryCode(story).locale}
          slug={story.full_slug}
          authorized_roles={story.content.authorized_roles}
        ></SEO>
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
            <FundsList slot='content' {...grabFundsProps(story.content)}>
              {blokToComponent({ blok: story.content, getComponent })}
            </FundsList>
          )}
          {story.content.component === 'fund-detail' && (
            <FundsDetail slot='content'>
              {blokToComponent({ blok: story.content, getComponent })}
            </FundsDetail>
          )}
          {story.content.component === 'courses-and-documents' && (
            <DedicatedContainer slot='content'>
              {story.content?.body?.map((c) => blokToComponent({ blok: c, getComponent })
              )}
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
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${globalContent?.gtmId}`}
            height='0'
            width='0'
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
      </>
    );
  }

  private maskUrl(): void {
    const { maskUrl } = this.props.location.state || {};
    return maskUrl ? window.history.replaceState('', '', maskUrl) : undefined;
  }
}
