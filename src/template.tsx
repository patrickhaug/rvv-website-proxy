import React, { Component } from 'react';
import { StoryData } from 'storyblok-js-client';
import { getComponent, blokToComponent } from './components';
import { GoogleTagManager } from './components/custom/google-tag-manager';
import {
  DomService,
  GlobalConfigProps,
  StoryblokNodeTree,
  StoryblokService,
  Breadcrumb,
  NavigationService,
  Language,
  LanguageService,
} from './services';
import { SEO } from './components/custom/seo';

export interface StoryDataFromGraphQLQuery extends StoryData {
  lang: string;
}

export interface EntryData extends GlobalConfigProps {
  googleTagManagerId: string;
  story?: StoryDataFromGraphQLQuery;
  navigation?: StoryblokNodeTree[];
  breadcrumbs?: Breadcrumb[];
  contact?: StoryData;
  footer?: StoryData;
  onClickNotice?: StoryData;
  languages?: Language[];
  search?: StoryData;
}

interface StoryblokEntryProps {
  pageContext: EntryData;
}

type StoryblokEntryState = EntryData;

const parseEntryData = ({ pageContext }: StoryblokEntryProps): StoryblokEntryState => {
  const { googleTagManagerId } = pageContext;
  const story = { ...pageContext.story };
  const footer = { ...pageContext.footer };
  const onClickNotice = { ...pageContext.onClickNotice };
  const search = { ...pageContext.search };

  story.content = story.content && JSON.parse(story.content.toString());
  footer.content = footer.content && JSON.parse(footer.content.toString());
  onClickNotice.content = onClickNotice.content && JSON.parse(onClickNotice.content.toString());
  search.content = search.content && JSON.parse(search.content.toString());

  return {
    googleTagManagerId,
    story,
    footer,
    onClickNotice,
    search,
    ...DomService.getGlobalConfig(story.uuid, story.lang),
  };
};

const RocheGlobalConfig = getComponent('roche-global-config') as React.ReactType;
const Header = 'roche-header' as React.ReactType;
const OffCanvas = 'roche-offcanvas-panel' as React.ReactType;
const Navigation = getComponent('roche-navigation') as React.ReactType;
const Search = 'roche-search' as React.ReactType;

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

  // eslint-disable-next-line class-methods-use-this
  public componentDidMount(): void {
    window.addEventListener('rocheLoginComplete', () => StoryblokService.redirect());

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
      contact,
      breadcrumbs,
      footer,
      onClickNotice,
      languages,
      search,
      ...globalConfig
    } = this.state;

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
        <RocheGlobalConfig {...globalConfig}></RocheGlobalConfig>
        <OffCanvas id="roche-offcanvas-menu">
          <Navigation
            tree={navigation}
            contactUrl={contact?.full_slug}
            contactText={contact?.content?.navigation_title}
            languages={languages}
          ></Navigation>
        </OffCanvas>
        <OffCanvas id="roche-offcanvas-search">
          <Search
            close-search-text={search?.content?.close_search_text}
            no-results-text={search?.content?.no_results_text}
            filter-container-text={search?.content?.filter_container_text}
            total-results-for-query={search?.content?.total_results_for_query}
            input-placeholder={search?.content?.input_placeholder}
          />
        </OffCanvas>
        <Header
          breadcrumbs={JSON.stringify(breadcrumbs)}
          languages={JSON.stringify(languages)}
        />
        {blokToComponent({ blok: story.content, getComponent })}
        {footer.content
          && blokToComponent({ blok: footer.content, getComponent })}
        {onClickNotice.content
          && blokToComponent({ blok: onClickNotice.content, getComponent })}
      </>
    );
  }
}
