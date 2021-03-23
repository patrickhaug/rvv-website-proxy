import { LanguageService } from '../language';

export interface GlobalConfigProps {
  baseDomain: string;
  brightcoveAccountId: string;
  brightcovePlayerId: string;
  cludoCustomerID: string;
  cludoEngineId: string | string[];
  cognitoUserpoolClientId: string;
  cognitoUserpoolId: string;
  locale: string;
  pageId: string;
  recaptchaKey: string;
  translationUrl: string;
  twitterHandle: string;
  whiteListedDomains: string;
}

type HTMLElementContent = string | { toString: () => string };

export const DomService = {
  createElement(tagName: string, content: HTMLElementContent = '', props: Record<string, string> = {}): HTMLElement {
    const element = document.createElement(tagName);
    element.innerHTML = typeof content === 'string' ? content : content.toString();
    Object.keys(props).forEach((prop) => {
      element.setAttribute(prop, props[prop]);
    });
    return element;
  },

  getGlobalConfig(pageId: string, locale: string): GlobalConfigProps {
    const parsedLocale = locale === 'default' ? LanguageService.defaultLocale : locale;

    return {
      baseDomain: process.env.GATSBY_BASE_DOMAIN,
      brightcoveAccountId: process.env.GATSBY_BRIGHTCOVE_ACCOUNT_ID,
      brightcovePlayerId: process.env.GATSBY_BRIGHTCOVE_PLAYER_ID,
      cludoCustomerID: process.env.GATSBY_CLUDO_CUSTOMER_ID,
      cludoEngineId: (process.env.GATSBY_CLUDO_ENGINE_ID_LIST)
        .replace(/[\s]/g, '')
        .split(',')
        .filter((item) => item.indexOf(`${parsedLocale}:`) === 0)
        .join()
        .substring(parsedLocale.length + 1, 8),
      cognitoUserpoolClientId: process.env.GATSBY_COGNITO_USERPOOL_CLIENT_ID,
      cognitoUserpoolId: process.env.GATSBY_COGNITO_USERPOOL_ID,
      locale,
      pageId: `storyblok:${process.env.GATSBY_STORYBLOK_SPACE_API_KEY_NAME}:${pageId}`,
      recaptchaKey: process.env.GATSBY_GOOGLE_RECAPTCHA_KEY,
      translationUrl: `${process.env.GATSBY_COMPONENTS_LIBRARY_URL}/rcm-component-library/assets/translations/${parsedLocale}.json`,
      twitterHandle: process.env.GATSBY_TWITTER_HANDLE,
      whiteListedDomains: process.env.GATSBY_WHITE_LISTED_DOMAINS,
    };
  },
};
