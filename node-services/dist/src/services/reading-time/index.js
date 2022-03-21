"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateReadingTime = void 0;
const averageWordsPerMinute = 200;
const calculateReadingTime = (article) => {
    var _a;
    const slottedText = (_a = article.content.body) === null || _a === void 0 ? void 0 : _a.reduce((totalText, comp) => {
        var _a;
        if (comp.text) {
            if (comp.component === 'rcm-richtext') {
                const richtext = (_a = comp.text.content) === null || _a === void 0 ? void 0 : _a.reduce((richtextTotal, content) => {
                    var _a;
                    const richtextElementsText = (_a = content.content) === null || _a === void 0 ? void 0 : _a.reduce((total, c) => (c.text ? total.concat(' ', c.text) : total), '');
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
exports.calculateReadingTime = calculateReadingTime;
