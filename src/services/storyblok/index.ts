import { IPluginRefObject } from 'gatsby';
import config from '../../../gatsby-config';

export const StoryblokService = {
  getConfig(): IPluginRefObject {
    return (config.plugins as IPluginRefObject[])
      .find((item) => item.resolve === 'gatsby-source-storyblok') || {} as IPluginRefObject;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getObject(): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { storyblok } = window as any;
    return storyblok || undefined;
  },
};
