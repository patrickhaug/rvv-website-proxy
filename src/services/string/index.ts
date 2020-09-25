const characters = 'abcdefghijklmnopqrstuvwxyz0123456789-_'; // base 64

export const StringService = {
  generate(length = 32): string {
    return [...new Array(length)]
      .map(() => characters[Math.floor(Math.random() * characters.length) % characters.length])
      .join('');
  },

  camelToKebab(string: string): string {
    return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  },

  snakeToKebab(string: string): string {
    return string.replace(/_([a-z])/g, '-$1');
  },

  kebabToCamel(string: string): string {
    return string.replace(/-([a-z])/g, (_, s) => s.toUpperCase());
  },

  isVideoUrl(url: string): boolean {
    const splitUrl = url.split('.');
    const extension = splitUrl[splitUrl.length - 1];
    return ['mp4', 'webm', 'avi'].indexOf(extension.toLowerCase()) >= 0;
  },
};
