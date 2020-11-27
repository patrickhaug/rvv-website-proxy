import { LanguageService } from '../language';

export interface GlobalConfigProps {
  pageId: string;
  recaptchaKey: string;
  brightcoveAccountId: string;
  brightcovePlayerId: string;
  cognitoUserpoolId: string;
  cognitoUserpoolClientId: string;
  locale: string;
  cludoEngineId: string | string[];
  cludoCustomerID: string;
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
      pageId: `storyblok:${process.env.GATSBY_STORYBLOK_SPACE_API_KEY_NAME || 'roche-website-starter:local'}:${pageId}`,
      recaptchaKey: process.env.GATSBY_GOOGLE_RECAPTCHA_KEY || '',
      brightcoveAccountId: process.env.GATSBY_BRIGHTCOVE_ACCOUNT_ID || '1752604059001',
      brightcovePlayerId: process.env.GATSBY_BRIGHTCOVE_PLAYER_ID || 'rJtrO8EKW',
      cludoCustomerID: process.env.GATSBY_CLUDO_CUSTOMER_ID || '473',
      cludoEngineId: (process.env.GATSBY_CLUDO_ENGINE_ID_LIST || 'en: 11916, de: 11917')
        .replace(/[\s]/g, '')
        .split(',')
        .filter((item) => item.indexOf(`${parsedLocale}:`) === 0)
        .join()
        .substring(parsedLocale.length + 1, 8),
      locale,
      cognitoUserpoolId: process.env.GATSBY_COGNITO_USERPOOL_ID || 'eu-central-1_9VwzPiCyy',
      cognitoUserpoolClientId: process.env.GATSBY_COGNITO_USERPOOL_CLIENT_ID || '1h7t2vm5sb7ok04v42ld4o17ls',
    };
  },
};
