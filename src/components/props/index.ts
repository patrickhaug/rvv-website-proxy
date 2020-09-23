import { ConversionService } from '../../services';
import { asset } from './asset';
import { multiAsset } from './multi-asset';

const defaultMapper = (key: string, value: unknown): Record<string, string> => ({
  [ConversionService.snakeToKebab(key)]: value instanceof Object
    ? JSON.stringify(value)
    : value.toString(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMappedProps = (key: string, blok: any): Record<string, string> => {
  if (blok instanceof Array) {
    return multiAsset(key, blok);
  }
  if (blok.fieldtype === 'asset') {
    return asset(key, blok);
  }

  return defaultMapper(key, blok);
};
