const averageWordsPerMinute = 200;

export const calculateReadingTime = (article): number => {
  const slottedText = article.content.body?.reduce((totalText, comp) => {
    if (comp.text) {
      if (comp.component === 'rcm-richtext') {
        const richtext = comp.text.content?.reduce((richtextTotal, content) => {
          const richtextElementsText = content.content?.reduce(
            (total, c) => (c.text ? total.concat(' ', c.text) : total),
            '',
          );
          return richtextTotal.concat(' ', richtextElementsText);
        }, '');

        return totalText.concat(' ', richtext);
      }
      return totalText.concat(' ', comp.text);
    }
    return totalText;
  }, '');

  const articleText = article.content.text || '';
  const totalText = slottedText + articleText;
  const words = totalText ? totalText.split(' ').length : 0;

  return Math.ceil(words / averageWordsPerMinute);
};
