export interface GlobalConfigProps {
  pageId: string;
  recaptchaKey: string;
  brightcoveAccountId: string;
  brightcovePlayerId: string;
  locale: string;
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
    return {
      pageId: `storyblok:${process.env.GATSBY_STORYBLOK_SPACE_API_KEY_NAME || 'roche-website-starter:local'}:${pageId}`,
      recaptchaKey: process.env.GATSBY_GOOGLE_RECAPTCHA_KEY || '',
      brightcoveAccountId: process.env.GATSBY_BRIGHTCOVE_ACCOUNT_ID || '1752604059001',
      brightcovePlayerId: process.env.GATSBY_BRIGHTCOVE_PLAYER_ID || 'rJtrO8EKW',
      locale,
    };
  },
};
