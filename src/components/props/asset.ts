import { StringService } from '../../services';

export interface AssetData {
  id: string;
  filename: string;
  title: string;
  copyright: string;
  focus: string;
  alt: string;
  name: string;
  fieldtype?: string;
}

const convertToStoryblokImageService = (url: string, focus: string | undefined): string => {
  if (focus) { url.replace('/f/', `${focus}/f/`); }
  url.replace('//a.storyblok.com/', '//img2.storyblok.com/$0x/');
  return url;
};
const maskAssetUrl = (url: string): string => url.replace('a.storyblok.com', process.env.GATSBY_ASSET_URL_MASK);

const parseAssetSource = (filename: string, focus: string | undefined): string => {
  if (typeof filename !== 'string' || StringService.isVideoUrl(filename)) {
    return filename;
  }

  return StringService.isImageUrl(filename)
    ? convertToStoryblokImageService(filename, focus)
    : maskAssetUrl(filename);
};

export const asset = (key: string, data: AssetData): Record<string, string> => ({
  [key]: JSON.stringify({
    src: parseAssetSource(data.filename, data.focus),
    caption: data.title,
    copyright: data.copyright,
    alt: data.alt,
  }),
});
