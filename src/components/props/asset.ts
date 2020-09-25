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

export const asset = (key: string, data: AssetData): Record<string, string> => ({
  [key]: JSON.stringify({
    src: typeof data.filename === 'string' && !StringService.isVideoUrl(data.filename)
      ? data.filename.replace('//a.storyblok.com/', '//img2.storyblok.com/$0x/')
      : data.filename,
    caption: data.title,
    copyright: data.copyright,
    alt: data.alt,
  }),
});
