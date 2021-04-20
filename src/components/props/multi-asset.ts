import { asset, AssetData } from './asset';
import { StringService } from '../../services';

export const multiAsset = (key: string, data: AssetData[]): Record<string, string> => ({
  [StringService.snakeToKebab(key)]: JSON.stringify(data.map((item) => asset(key, item)[key])),
});
