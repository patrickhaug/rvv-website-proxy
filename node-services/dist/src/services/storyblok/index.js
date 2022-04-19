"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryblokService = void 0;
const gatsby_config_1 = __importDefault(require("../../../gatsby-config"));
const deepen = (obj) => {
    const result = {};
    Object.keys(obj).forEach((key) => {
        const parts = key.split('.');
        let target = result;
        while (parts.length > 1) {
            const part = parts.shift();
            target[part] = target[part] || {};
            target = target[part] || {};
        }
        target[parts[0]] = obj[key];
    });
    return result;
};
const getUrlParams = () => window.location.search.substr(1)
    .split('&')
    .filter((slug) => !!slug)
    .reduce((accumulator, slug) => (Object.assign(Object.assign({}, accumulator), (slug.split('=')[0] && {
    [slug.split('=')[0]]: slug.split('=')[1] || true,
}))), {});
exports.StoryblokService = {
    getConfig() {
        return gatsby_config_1.default.plugins
            .find((item) => item.resolve === 'gatsby-source-graphql') || {};
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getObject() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { storyblok } = window;
        return storyblok || undefined;
    },
    getLocalizedDatasourceEntries(localizeDatasourceEntries) {
        const { datasourceEntries, dimensions, countryCode, defaultValue, } = localizeDatasourceEntries;
        if (dimensions.indexOf(countryCode) === -1) {
            return defaultValue;
        }
        if (datasourceEntries[dimensions.indexOf(countryCode)]) {
            return datasourceEntries[dimensions.indexOf(countryCode)];
        }
        return defaultValue;
    },
    parseDatasourceEntries(datasourceEntries) {
        const datasourceValues = datasourceEntries.reduce((object, item) => {
            var _a, _b;
            if (item.dimension_value) {
                return Object.assign(Object.assign({}, object), { 
                    // empty datasource returns "''"
                    [item.name]: (_a = item.dimension_value) === null || _a === void 0 ? void 0 : _a.replace(/^''$/, '') });
            }
            return Object.assign(Object.assign({}, object), { 
                // empty datasource returns "''"
                [item.name]: (_b = item.value) === null || _b === void 0 ? void 0 : _b.replace(/^''$/, '') });
        }, {});
        return deepen(datasourceValues);
    },
    getCountryCode(story) {
        var _a, _b, _c, _d, _e;
        return {
            countryCode: ((_a = story.full_slug) === null || _a === void 0 ? void 0 : _a.split('/')[0]) || 'at-de',
            country: ((_c = (_b = story.full_slug) === null || _b === void 0 ? void 0 : _b.split('/')[0]) === null || _c === void 0 ? void 0 : _c.split('-')[0]) || 'at',
            locale: ((_e = (_d = story.full_slug) === null || _d === void 0 ? void 0 : _d.split('/')[0]) === null || _e === void 0 ? void 0 : _e.split('-')[1]) || 'de',
        };
    },
    getUserTypeFromSlug(story) {
        var _a;
        const userType = (_a = story.full_slug) === null || _a === void 0 ? void 0 : _a.split('/')[1];
        if (userType === 'retail' || userType === 'institutional') {
            return userType;
        }
        return '';
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async redirect(callback) {
        // eslint-disable-next-line compat/compat
        return new Promise((resolve) => {
            const storyblok = exports.StoryblokService.getObject();
            const params = getUrlParams();
            const isValidRedirect = typeof params.redirect === 'string';
            if (storyblok) {
                storyblok.get({ slug: isValidRedirect ? params.redirect : '/home' }, (...args) => {
                    if (callback) {
                        callback(...args);
                    }
                    resolve();
                });
            }
            else {
                window.location.href = isValidRedirect ? params.redirect : '/';
                resolve();
            }
        });
    },
};
