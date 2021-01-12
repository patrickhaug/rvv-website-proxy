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
      baseDomain: process.env.GATSBY_BASE_DOMAIN || 'roche',
      brightcoveAccountId: process.env.GATSBY_BRIGHTCOVE_ACCOUNT_ID || '1752604059001',
      brightcovePlayerId: process.env.GATSBY_BRIGHTCOVE_PLAYER_ID || 'rJtrO8EKW',
      cludoCustomerID: process.env.GATSBY_CLUDO_CUSTOMER_ID || '473',
      cludoEngineId: (process.env.GATSBY_CLUDO_ENGINE_ID_LIST || 'en: 11916, de: 11917')
        .replace(/[\s]/g, '')
        .split(',')
        .filter((item) => item.indexOf(`${parsedLocale}:`) === 0)
        .join()
        .substring(parsedLocale.length + 1, 8),
      cognitoUserpoolClientId: process.env.GATSBY_COGNITO_USERPOOL_CLIENT_ID || '1h7t2vm5sb7ok04v42ld4o17ls',
      cognitoUserpoolId: process.env.GATSBY_COGNITO_USERPOOL_ID || 'eu-central-1_9VwzPiCyy',
      locale,
      pageId: `storyblok:${process.env.GATSBY_STORYBLOK_SPACE_API_KEY_NAME || 'roche-website-starter:local'}:${pageId}`,
      recaptchaKey: process.env.GATSBY_GOOGLE_RECAPTCHA_KEY || '',
      translationUrl: `${process.env.GATSBY_ROCHE_COMPONENTS_LIBRARY_URL || 'http://localhost:3333/dist'}/roche-component-library/assets/translations/${parsedLocale}.json`,
      twitterHandle: process.env.GATSBY_TWITTER_HANDLE || '@roche',
      whiteListedDomains: process.env.GATSBY_WHITE_LISTED_DOMAINS || '["roche.com"]',
    };
  },
};
