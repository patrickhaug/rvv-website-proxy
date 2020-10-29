import StoryblokClient, { StoryData } from 'storyblok-js-client';
import { unflatten } from './utils/unflatten';
import { sortTree } from './utils/sort-tree';
import { StoryblokService } from '../storyblok';

interface StoryblokNode {
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
  page?: StoryData;
}

export interface StoryblokNodeTree extends StoryblokNode {
  children: StoryblokNode[];
}

const attachStoryToLeaf = (stories: StoryData[]) => (
  (leaf: StoryblokNodeTree): StoryblokNodeTree => ({
    ...leaf,
    children: leaf.children.map(attachStoryToLeaf(stories)),
    page: stories.find((story) => story.uuid === leaf.uuid),
  })
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
  storyblokClient: new StoryblokClient({
    accessToken: StoryblokService.getConfig().options.accessToken as string,
  }),
  shouldHide(taglist: string[]): boolean {
    return (
      taglist.some((tag) => this.navigationExclusionTags.indexOf(tag) >= 0)
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
  async getNavigation(stories: StoryData[]): Promise<StoryblokNodeTree[]> {
    const tree = (await this.getSortedTree())
      .map(attachStoryToLeaf(stories))
      .map(pruneHiddenBranches);

    return tree;
  },
};
