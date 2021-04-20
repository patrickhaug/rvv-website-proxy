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

const convertToStoryblokImageService = (url: string, focus: string): string => {
  if (focus !== '') {
    return url.replace('//a.storyblok.com/', `//img2.storyblok.com/$0x/filters:focal(${focus})/`);
  }
  return url.replace('//a.storyblok.com/', '//img2.storyblok.com/$0x/');
};
const maskAssetUrl = (url: string): string => url.replace('a.storyblok.com', process.env.GATSBY_ASSET_URL_MASK);

const parseAssetSource = (filename: string, focus: string): string => {
  if (typeof filename !== 'string' || StringService.isVideoUrl(filename)) {
    return filename;
  }

  return StringService.isImageUrl(filename)
    ? convertToStoryblokImageService(filename, focus)
    : maskAssetUrl(filename);
};

export const asset = (key: string, data: AssetData): Record<string, string> => ({
  [StringService.snakeToKebab(key)]: JSON.stringify({
    src: parseAssetSource(data.filename, data.focus),
    caption: data.title,
    copyright: data.copyright,
    alt: data.alt,
  }),
});
