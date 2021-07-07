import React, { Component } from 'react';
import { StoryData } from 'storyblok-js-client';

import { getComponent, blokToComponent } from '../components';
import { GoogleTagManager } from '../components/custom/google-tag-manager';
import {
  DomService,
  GlobalConfigProps,
  StoryblokNodeTree,
  StoryblokService,
  Breadcrumb,
  NavigationService,
  Language,
  LanguageService,
} from '../services';
import { SEO } from '../components/custom/seo';

export interface StoryDataFromGraphQLQuery extends StoryData {
  lang: string;
  related?: StoryData;
}

export interface EntryData extends GlobalConfigProps {
  googleTagManagerId: string;
  story?: StoryDataFromGraphQLQuery;
  navigation?: StoryblokNodeTree[];
  breadcrumbs?: Breadcrumb[];
  contact?: StoryData;
  languages?: Language[];
  search?: StoryData;
  related?: StoryData;
  globalContent?: string;
  articleCategories?: string;
}

interface StoryblokEntryProps {
  pageContext: EntryData;
  location: {
    state?: {
      maskUrl?: string;
    };
  };
}

type StoryblokEntryState = EntryData;

const parseEntryData = ({ pageContext }: StoryblokEntryProps): StoryblokEntryState => {
  const { googleTagManagerId } = pageContext;
  const story = { ...pageContext.story, related: pageContext.related };

  return {
    googleTagManagerId,
    story,
    ...DomService.getGlobalConfig(story.uuid, story.lang),
  };
};

const RcmGlobalConfig = getComponent('rcm-global-config') as React.ElementType;
const RcmGlobalContent = getComponent('rcm-global-content') as React.ElementType;
const Header = 'rcm-header' as React.ElementType;
// const OffCanvas = 'rcm-offcanvas-panel' as React.ElementType;
const Navigation = getComponent('rcm-navigation') as React.ElementType;
const Article = 'rcm-layout-article' as React.ElementType;
const Container = 'rcm-layout-container' as React.ElementType;
const FundsList = 'rcm-layout-funds' as React.ElementType;
const FundsDetail = 'rcm-layout-fund' as React.ElementType;

// const Search = 'rcm-search' as React.ElementType;

// eslint-disable-next-line import/no-default-export
export default class StoryblokEntry extends Component<StoryblokEntryProps, StoryblokEntryState> {
  public static getDerivedStateFromProps(
    props: StoryblokEntryProps, state: StoryblokEntryState,
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
        const breadcrumbs = NavigationService.getBreadcrumbs(this.state.story.uuid, navigationData);
        this.setState({ navigation: navigationData, breadcrumbs });
      });

    NavigationService.getContactPage(this.state.story.lang)
      .then((contactPage) => this.setState({ contact: contactPage }));

    LanguageService.getLanguages()
      .then((languages) => this.setState({ languages }));
  }

  public render(): JSX.Element {
    const {
      googleTagManagerId,
      story,
      navigation,
      breadcrumbs,
      languages,
      globalContent,
      articleCategories,
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

    return (
      <>
        <GoogleTagManager
          googleTagManagerId={googleTagManagerId}
        ></GoogleTagManager>
        <SEO
          {...story.content.meta_tags}
          lang={story.lang}
          slug={story.full_slug}
          authorized_roles = {story.content.authorized_roles}
        ></SEO>
        <RcmGlobalConfig {...globalConfig}></RcmGlobalConfig>
        <RcmGlobalContent globalContent={globalContent}></RcmGlobalContent>
        <Navigation
          tree={navigation}
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
            related={JSON.stringify(story.related)}
            categories={articleCategories}>{
              blokToComponent({ blok: story.content, getComponent })
            }</Article>
          }
          {story.content.component === 'funds'
          && <FundsList {...grabFundsProps(story.content)}>{
            blokToComponent({ blok: story.content, getComponent })
          }</FundsList>
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
      </>
    );
  }

  private maskUrl(): void {
    const { maskUrl } = this.props.location.state || {};
    return maskUrl ? window.history.replaceState('', '', maskUrl) : undefined;
  }
}
