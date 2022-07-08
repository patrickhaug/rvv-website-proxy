import React, { Component } from 'react';
import { StoryData } from 'storyblok-js-client';
// import { SbEditableContent } from 'storyblok-react';
import { getComponent, blokToComponent } from '../components';
import {
  DomService,
  GlobalConfigProps,
  StoryblokNodeTree,
  StoryblokService,
  NavigationService,
  Language,
  GlobalContent,
} from '../services';
// import { SEO } from '../components/custom/seo';
// import { markupFromRichtextField } from '../components/custom/richtext';

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

// Datasources
// const rvvGlobalConfig = getComponent('rvv-global-config') as React.ElementType;
// const rvvGlobalContent = getComponent('rvv-global-content') as React.ElementType;
const Navigation = getComponent('rvv-navigation') as React.ElementType;
const Footer = getComponent('rvv-footer') as React.ElementType;
const Container = 'rvv-layout-container' as React.ElementType;
// const ContactButton = 'rvv-contact-button' as React.ElementType;

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
    window.addEventListener('rvvLoginComplete', () => StoryblokService.redirect());

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

    const ua = window.navigator.userAgent;
    const isIE = ua.indexOf('MSIE ') > 0 || ua.indexOf('Trident/') > 0;
    this.setState({ showIEModal: isIE });
  }

  public render(): JSX.Element {
    const {
      story, navigation,
    } = this.state;

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
      <>
        {/*
        <SEO
          {...story.content.meta_tags}
          lang={StoryblokService.getCountryCode(story).locale}
          slug={story.full_slug}
          authorized_roles={story.content.authorized_roles}
        ></SEO>
         */}
        <Navigation
          tree={navigation}
          getComponent={getComponent}
          countryCode={StoryblokService.getCountryCode(story).countryCode}
          currentCountry={StoryblokService.getCountryCode(story).country}
          currentLanguage={StoryblokService.getCountryCode(story).locale}
          alternates={JSON.stringify(story.alternates)}
        ></Navigation>
        <Container
          kind="normal"
        >
          <div slot='content'>
            {blokToComponent({ blok: story.content, getComponent })}
          </div>
        </Container>
        {/* <ContactButton
          link={globalContent?.contact?.button?.link}
          name={globalContent?.contact?.button?.name}
        ></ContactButton> */}
        <Footer
          tree={navigation}
          getComponent={getComponent}
          countryCode={StoryblokService.getCountryCode(story).countryCode}
        ></Footer>
      </>
    );
  }

  private maskUrl(): void {
    const { maskUrl } = this.props.location.state || {};
    return maskUrl ? window.history.replaceState('', '', maskUrl) : undefined;
  }
}
