import StoryblokClient, { StoryData } from 'storyblok-js-client';
import { unflatten } from './utils/unflatten';
import { sortTree, SortableItem } from './utils/sort-tree';
import { StoryblokService } from '../storyblok';

interface StoryblokNode {
  children?: SortableItem[];
  id: number;
  is_folder: boolean;
  is_startpage: boolean;
  name: string;
  parent_id: number;
  position: number;
  published: boolean;
  real_path: string;
  slug: string;
  uuid: string;
  page?: PageData;
}

export interface PageData extends StoryData {
  lang: string;
}

export interface StoryblokNodeTree extends StoryblokNode {
  children: StoryblokNode[];
}

const attachStoryToLeaf = (stories: StoryData[], lang: string) => (
  (leaf: StoryblokNodeTree): StoryblokNodeTree => {
    const page = stories.find((story) => story.uuid === leaf.uuid);
    return {
      ...leaf,
      real_path: `/${lang !== 'default' ? lang : ''}${leaf.real_path}`.replace('//', '/'),
      children: leaf.children.map(attachStoryToLeaf(stories, lang)),
      page,
    };
  }
);

const pruneHiddenBranches = (leaf: StoryblokNodeTree): StoryblokNodeTree => ({
  ...leaf,
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  page: (leaf.page?.tag_list?.length && NavigationService.shouldHide(leaf.page.tag_list))
    ? undefined
    : leaf.page,
  children: leaf.children.map(pruneHiddenBranches),
});

export const NavigationService = {
  navigationExclusionTags: ['access:private', 'navigation:hide'],
  navigationForcedInclusionTags: ['navigation:force-show'],
  navigationContactTag: ['navigation:contact-page'],
  storyblokClient: new StoryblokClient({
    accessToken: StoryblokService.getConfig().options.accessToken as string,
  }),
  shouldHide(taglist: string[]): boolean {
    return (
      taglist.some((tag) => (
        this.navigationExclusionTags.indexOf(tag) >= 0
        || this.navigationContactTag.indexOf(tag) >= 0
      ))
      && !taglist.some((tag) => this.navigationForcedInclusionTags.indexOf(tag) >= 0)
    );
  },
  async getAllLinks(): Promise<StoryblokNode[]> {
    const allLinks = await this.storyblokClient.getAll('cdn/links');
    return allLinks;
  },
  async getSortedTree(): Promise<StoryblokNodeTree[]> {
    const tree = unflatten(await this.getAllLinks()) as StoryblokNodeTree[];
    sortTree(tree);
    return tree;
  },
  async getNavigation(stories: StoryData[], lang: string): Promise<StoryblokNodeTree[]> {
    const tree = (await this.getSortedTree())
      .map(attachStoryToLeaf(stories, lang))
      .map(pruneHiddenBranches);

    return tree;
  },
  async getContactPage(lang: string): Promise<StoryData> {
    const queryOptions = {
      with_tag: this.navigationContactTag[0],
      ...(lang !== 'default' && { starts_with: `${lang}/*` }),
    };
    const { data } = await this.storyblokClient.get('cdn/stories/', queryOptions);
    const contactPage = data.stories[0];

    if (contactPage) {
      contactPage.full_slug = `/${contactPage?.full_slug}`.replace('//', '/');
    }
    return contactPage;
  },
};
