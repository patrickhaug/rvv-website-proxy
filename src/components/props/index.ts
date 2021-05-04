import { StringService } from '../../services';
import { asset } from './asset';
import { multiAsset } from './multi-asset';
import { multiLink } from './multi-link';

const defaultMapper = (key: string, value: unknown): Record<string, string> => ({
  [StringService.snakeToKebab(key)]: value instanceof Object
    ? JSON.stringify(value)
    : value.toString(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMappedProps = (key: string, blok: any): Record<string, string> => {
  /**
   * We have a linked story, which is resolved automatically after
   * setting the right value in gatsby.config.js
   */
  if (blok.content) {
    // console.log('story', key, blok);

    const linkObject = {
      slug: blok.slug,
      fullSlug: blok.full_slug,
      lang: blok.lang,
      translatedSlugs: blok.translated_slug,
      alternates: blok.alternates,
    };

    const props = {
      ...blok.content,
      // Extracted link props from linked story source
      link: linkObject,
    };

    if (props.image_src) {
      const parsedImage = asset('image_src', props.image_src)['image-src'];
      const newProps = {
        ...props,
        // Just for convience to have consistent imageSrc keys in the components
        // eslint-disable-next-line @typescript-eslint/camelcase
        imageSrc: parsedImage,
      };
      return defaultMapper(key, newProps);
    }
    return defaultMapper(key, props);
  }
  if (blok instanceof Array && blok.length) {
    /**
     * We have to deal with an array of items, probably multioptions
     */
    const mappedKeys = [];
    blok.forEach((b) => {
      const parsedObject = {};
      Object.keys(b).forEach((k) => {
        const mappedProps = getMappedProps(k, b[k]);
        const kebabifiedKey = StringService.snakeToKebab(k);

        if (mappedProps[kebabifiedKey]) {
          parsedObject[StringService.kebabToCamel(kebabifiedKey)] = mappedProps[kebabifiedKey];
        }
      });
      mappedKeys.push(parsedObject);
    });
    return defaultMapper(key, mappedKeys);
  }
  if (blok instanceof Array && blok.length && typeof blok[0].filename === 'string') {
    // console.log('mul ass', key);

    return multiAsset(key, blok);
  }
  if (blok.fieldtype === 'asset') {
    // console.log('ass', key);

    return asset(key, blok);
  }
  if (blok.fieldtype === 'multilink') {
    // console.log('mul link', key);

    return multiLink(key, blok);
  }

  return defaultMapper(key, blok);
};
