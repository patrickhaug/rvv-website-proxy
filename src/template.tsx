import React, { Component } from 'react';
import { StoryData } from 'storyblok-js-client';
import { getComponent, blokToComponent } from './components';
import {
  DomService, GlobalConfigProps, StoryblokNodeTree, StoryblokService, Breadcrumb, NavigationService,
} from './services';
import { SEO } from './components/custom/seo';

export interface StoryDataFromGraphQLQuery extends StoryData {
  lang: string;
}

export interface EntryData extends GlobalConfigProps {
  story?: StoryDataFromGraphQLQuery;
  navigation?: StoryblokNodeTree[];
  breadcrumbs?: Breadcrumb[];
  footer?: StoryData;
  onClickNotice?: StoryData;
}

interface StoryblokEntryProps {
  pageContext: EntryData;
}

type StoryblokEntryState = EntryData;

const parseEntryData = ({ pageContext }: StoryblokEntryProps): StoryblokEntryState => {
  const story = { ...pageContext.story };
  const footer = { ...pageContext.footer };
  const onClickNotice = { ...pageContext.onClickNotice };

  story.content = JSON.parse(story.content.toString());
  footer.content = JSON.parse(footer.content.toString());
  onClickNotice.content = JSON.parse(onClickNotice.content.toString());

  return {
    story,
    footer,
    onClickNotice,
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
    fetch('/navigation-data.json')
      .then((res) => res.json())
      .then((navigationData) => {
        const breadcrumbs = NavigationService.getBreadcrumbs(this.state.story.uuid, navigationData);
        this.setState({ navigation: navigationData[this.state.story.lang], breadcrumbs });
      });
  }

  public render(): JSX.Element {
    const {
      story, navigation, breadcrumbs, footer, onClickNotice, ...globalConfig
    } = this.state;

    return (
      <>
        <SEO {...story.content.meta_tags} lang={story.lang} slug={story.full_slug}></SEO>
        <RocheGlobalConfig {...globalConfig}></RocheGlobalConfig>
        <OffCanvas id="roche-offcanvas-menu">
          <Navigation tree={navigation}></Navigation>
        </OffCanvas>
        <OffCanvas id="roche-offcanvas-search">
          <Search />
        </OffCanvas>
        <Header breadcrumbs={JSON.stringify(breadcrumbs)}></Header>
        {blokToComponent({ blok: story.content, getComponent })}
        {blokToComponent({ blok: footer.content, getComponent })}
        {blokToComponent({ blok: onClickNotice.content, getComponent })}
      </>
    );
  }
}
