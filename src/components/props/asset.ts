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

export const asset = (_: string, data: AssetData): Record<string, string> => ({
  src: data.filename,
  caption: data.title,
  copyright: data.copyright,
  alt: data.alt,
});
