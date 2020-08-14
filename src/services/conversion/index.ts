export const ConversionService = {
  camelToKebab(string: string): string {
    return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  },

  kebabToCamel(string: string): string {
    return string.replace(/-([a-z])/g, (_, s) => s.toUpperCase());
  },
};
