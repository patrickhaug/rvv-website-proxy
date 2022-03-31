"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationService = void 0;
const storyblok_js_client_1 = __importDefault(require("storyblok-js-client"));
const unflatten_1 = require("./utils/unflatten");
const sort_tree_1 = require("./utils/sort-tree");
const storyblok_1 = require("../storyblok");
const attachStoryToLeaf = (stories, lang) => ((leaf) => {
    const page = stories.find((story) => story.uuid === leaf.uuid);
    return Object.assign(Object.assign({}, leaf), { real_path: `/${lang !== 'default' ? lang : ''}${leaf.real_path}`.replace('//', '/'), children: leaf.children.map(attachStoryToLeaf(stories, lang)), page });
});
const pruneHiddenBranches = (leaf) => {
    var _a, _b;
    return (Object.assign(Object.assign({}, leaf), { 
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        page: (((_b = (_a = leaf.page) === null || _a === void 0 ? void 0 : _a.tag_list) === null || _b === void 0 ? void 0 : _b.length) && exports.NavigationService.shouldHide(leaf.page.tag_list))
            ? undefined
            : leaf.page, children: leaf.children.map(pruneHiddenBranches) }));
};
exports.NavigationService = {
    navigationExclusionTags: ['access:private', 'navigation:hide'],
    navigationForcedInclusionTags: ['navigation:force-show'],
    navigationContactTag: ['navigation:contact-page'],
    storyblokClient: new storyblok_js_client_1.default({
        accessToken: storyblok_1.StoryblokService.getConfig().options.accessToken,
    }),
    shouldHide(taglist) {
        return (taglist.some((tag) => (this.navigationExclusionTags.indexOf(tag) >= 0
            || this.navigationContactTag.indexOf(tag) >= 0))
            && !taglist.some((tag) => this.navigationForcedInclusionTags.indexOf(tag) >= 0));
    },
    async getAllLinks() {
        const allLinks = await this.storyblokClient.getAll('cdn/links');
        return allLinks;
    },
    async getSortedTree() {
        const tree = (0, unflatten_1.unflatten)(await this.getAllLinks());
        (0, sort_tree_1.sortTree)(tree);
        return tree;
    },
    async getNavigation(stories, lang) {
        const tree = (await this.getSortedTree())
            .map(attachStoryToLeaf(stories, lang))
            .map(pruneHiddenBranches);
        return tree;
    },
    async getContactPage(lang) {
        const queryOptions = Object.assign({ with_tag: this.navigationContactTag[0] }, (lang !== 'default' && { starts_with: `${lang}/*` }));
        const { data } = await this.storyblokClient.get('cdn/stories/', queryOptions);
        const contactPage = data.stories[0];
        if (contactPage) {
            contactPage.full_slug = `/${contactPage === null || contactPage === void 0 ? void 0 : contactPage.full_slug}`.replace('//', '/');
        }
        return contactPage;
    },
};
