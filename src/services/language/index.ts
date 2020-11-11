import StoryblokClient from 'storyblok-js-client';
import { StoryblokService } from '../storyblok';

export interface Language {
  locale: string;
  label?: string;
}

export const LanguageService = {
  defaultLocale: 'en',
  storyblokClient: new StoryblokClient({
    accessToken: StoryblokService.getConfig().options.accessToken as string,
  }),
  async getLanguages(): Promise<Language[]> {
    const { data } = await this.storyblokClient.get('cdn/spaces/me');
    const languages = data?.space?.language_codes?.map((el) => ({ locale: el }));
    return [{ locale: 'default', label: this.defaultLocale }, ...languages];
  },
};
