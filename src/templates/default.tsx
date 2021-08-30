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

export interface StoryDataFromGraphQLQuery extends StoryData {
  lang: string;
  related?: StoryData;
  articleCategories?: StoryData;
  articles?: StoryData;
}

export interface EntryData extends GlobalConfigProps {
  story?: StoryDataFromGraphQLQuery;
  navigation?: StoryblokNodeTree[];
  contact?: StoryData;
  languages?: Language[];
  search?: StoryData;
  related?: StoryData;
  globalContent?: GlobalContent;
  articleCategories?: StoryData;
  articles?: StoryData;
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
    related: pageContext.related,
    articles: pageContext.articles,
    articleCategories: pageContext.articleCategories,
  };

  return {
    story,
    showIEModal: false,
    ...DomService.getGlobalConfig(
      story.uuid,
      StoryblokService.getCountryCode(story).locale,
      StoryblokService.getCountryCode(story).country,
    ),
    globalContent: pageContext.globalContent
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

// eslint-disable-next-line import/no-default-export
export default class StoryblokEntry extends Component<StoryblokEntryProps, StoryblokEntryState> {
  public static getDerivedStateFromProps(
    props: StoryblokEntryProps,
    state: StoryblokEntryState,
  ): StoryblokEntryState {
    return state.story.uuid !== props.pageContext.story.uuid ? parseEntryData(props) : null;
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

    NavigationService.getContactPage(this.state.story.lang)
      .then((contactPage) => this.setState({ contact: contactPage }));

    LanguageService.getLanguages().then((languages) => this.setState({ languages }));

    DomService.activateConsentScript();

    const ua = window.navigator.userAgent;
    const isIE = ua.indexOf('MSIE ') > 0 || ua.indexOf('Trident/') > 0;
    this.setState({ showIEModal: isIE });
  }

  public render(): JSX.Element {
    const {
      story,
      navigation,
      globalContent,
      showIEModal,
      ...globalConfig
    } = this.state;

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
        nestableArticles.articles = JSON.stringify(story.articles);
        nestableArticles.categories = JSON.stringify(story.articleCategories);
      }
      const nestableCategoryArticles = story.content.body?.find((item: SbEditableContent) => item.component === 'rcm-category-articles');
      if (nestableCategoryArticles) {
        nestableCategoryArticles.articles = JSON.stringify(story.articles);
        nestableCategoryArticles.categories = JSON.stringify(story.articleCategories);
      }
    }

    return (
      <>
        <GoogleTagManager googleTagManagerId={globalContent?.gtmId}></GoogleTagManager>
        <SEO
          {...story.content.meta_tags}
          lang={StoryblokService.getCountryCode(story).locale}
          slug={story.full_slug}
          authorized_roles={story.content.authorized_roles}
        ></SEO>
        {/* <RcmCountrySwitchModal globalContent={globalContent}></RcmCountrySwitchModal> */}
        <RcmUserSwitchModal
          userTypeFromSlug={StoryblokService.getUserTypeFromSlug(story)}
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
          userTypeFromSlug={StoryblokService.getUserTypeFromSlug(story)}
          countryCode={StoryblokService.getCountryCode(story).countryCode}
          currentCountry={StoryblokService.getCountryCode(story).country}
          currentLanguage={StoryblokService.getCountryCode(story).locale}
        ></Navigation>
        <Container>
          {story.content.component === 'article' && (
            <Article
              slot='content'
              article={JSON.stringify(
                { ...story.content, readingTime: calculateReadingTime(story) },
              )}
              related={JSON.stringify(story.related)}
              categories={JSON.stringify(story.articleCategories)}
            >
              {blokToComponent({ blok: story.content, getComponent })}
            </Article>
          )}
          {story.content.component === 'articles' && (
            <Articles
              slot='content'
              articles={JSON.stringify(story.articles)}
              categories={JSON.stringify(story.articleCategories)}
              dropdown-label={story.content.dropdown_label}
              headline={story.content.headline}
              max-articles-number={story.content.max_articles_number}
              text={story.content.text}
            >{blokToComponent({ blok: story.content, getComponent })}</Articles>
          )}
          {story.content.component === 'funds' && (
            <FundsList slot='content' {...grabFundsProps(story.content)}>
              {blokToComponent({ blok: story.content, getComponent })}
            </FundsList>
          )}
          {story.content.component === 'fund' && (
            <FundsDetail slot='content' {...grabFundsProps(story.content)}>
              {/* These are componentd filled with dummy data */}
              {blokToComponent({ blok: story.content, getComponent })}
            </FundsDetail>
          )}
          {story.content.component !== 'article'
            && <div slot='content'>{blokToComponent({ blok: story.content, getComponent })}</div>}
        </Container>
        <ContactButton
          link={globalContent?.contact?.button?.link}
          name={globalContent?.contact?.button?.name}
        ></ContactButton>
        <Footer
          tree={navigation}
          getComponent={getComponent}
          userTypeFromSlug={StoryblokService.getUserTypeFromSlug(story)}
          countryCode={StoryblokService.getCountryCode(story).countryCode}>
        </Footer>
        {/* End Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${globalContent?.gtmId}`}
            height="0"
            width="0"
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
