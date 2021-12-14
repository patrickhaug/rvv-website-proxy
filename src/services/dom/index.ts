// eslint-disable-next-line import/no-cycle
import { LanguageService } from '../language';

export type Country = 'at' | 'bg' | 'ch' | 'cz' | 'de' | 'es' | 'fr' | 'hr' | 'hu' | 'it' | 'li' | 'lu' | 'pl' | 'ro' | 'si' | 'sk';
export type Locale = 'de' | 'en' | 'it' | 'bg' | 'fr' | 'salzburg';

export interface GlobalConfigProps {
  baseDomain: string;
  brightcoveAccountId: string;
  brightcovePlayerId: string;
  cludoCustomerID: string;
  cludoEngineId: string | string[];
  cognitoUserpoolClientId: string;
  cognitoUserpoolId: string;
  country: Country;
  locale: Locale;
  pageId: string;
  recaptchaKey: string;
  translationUrl: string;
  twitterHandle: string;
  whiteListedDomains: string;
  storyblokAccessToken: string;
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

  activateConsentScript(): void {
    const oneTrustScriptPlaceholder = document.getElementById('oneTrustScriptPlaceholder');

    if (oneTrustScriptPlaceholder) {
      const activatedOneTrustScript = document.createElement('script');
      const oneTrustScriptSettings = {
        src: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
        type: 'text/javascript',
        charSet: 'UTF-8',
        async: 'true',
        defer: 'true',
        'data-domain-script': `${process.env.GATSBY_RCM_ONETRUST_KEY}`,
        'data-document-language': 'true',
      };

      Object.entries(oneTrustScriptSettings).forEach(([attrName, attrValue]) => {
        activatedOneTrustScript.setAttribute(attrName, attrValue);
      });

      document.head.replaceChild(activatedOneTrustScript, oneTrustScriptPlaceholder);
    }
  },

  getGlobalConfig(pageId: string, locale: string, country: string): GlobalConfigProps {
    const parsedLocale: Locale = locale === 'default' ? LanguageService.defaultLocale as Locale : locale as Locale;
    const parsedCountry: Country = country === 'default' ? LanguageService.defaultCountry as Country : country as Country;

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
      // todo: replace with correct country code
      country: parsedCountry,
      locale: parsedLocale,
      pageId: `storyblok:${process.env.GATSBY_STORYBLOK_SPACE_API_KEY_NAME}:${pageId}`,
      recaptchaKey: process.env.GATSBY_GOOGLE_RECAPTCHA_KEY,
      translationUrl: `${process.env.GATSBY_COMPONENTS_LIBRARY_URL}/rcm-component-library/assets/translations/${parsedLocale}.json`,
      twitterHandle: process.env.GATSBY_TWITTER_HANDLE,
      whiteListedDomains: process.env.GATSBY_WHITE_LISTED_DOMAINS,
      storyblokAccessToken: process.env.GATSBY_STORYBLOK_SPACE_API_KEY,
    };
  },
};
