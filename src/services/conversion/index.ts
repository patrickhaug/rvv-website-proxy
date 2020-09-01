export const ConversionService = {
  camelToKebab(string: string): string {
    return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  },

  snakeToKebab(string: string): string {
    return string.replace(/_([a-z])/g, '-$1');
  },

  kebabToCamel(string: string): string {
    return string.replace(/-([a-z])/g, (_, s) => s.toUpperCase());
  },
};
