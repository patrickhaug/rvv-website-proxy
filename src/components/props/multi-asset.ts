import { asset, AssetData } from './asset';

export const multiAsset = (key: string, data: AssetData[]): Record<string, string> => ({
  [key]: JSON.stringify(data.map((item) => asset(key, item)[key])),
});
