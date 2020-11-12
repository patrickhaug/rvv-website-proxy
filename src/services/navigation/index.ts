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
  breadcrumbs?: Breadcrumb[];
}

export interface Breadcrumb {
  label?: string;
  href?: string;
}

export interface StoryblokNodeTree extends StoryblokNode {
  children: StoryblokNode[];
}

const attachStoryToLeaf = (stories: StoryData[], lang: string, breadcrumbs: Breadcrumb[] = []) => (
  (leaf: StoryblokNodeTree): StoryblokNodeTree => {
    const page = stories.find((story) => story.uuid === leaf.uuid);

    const breadcrumb = {
      label: page?.content.navigation_title || page?.name || leaf.name,
      href: (leaf.is_folder
        ? `/${lang !== 'default' ? lang : ''}${leaf.real_path}`
        : `/${page?.full_slug}`)
        .replace('//', '/'),
    };

    const updatedBreadcrumbs = [...(leaf.breadcrumbs || breadcrumbs), { ...breadcrumb }];

    return {
      ...leaf,
      // eslint-disable-next-line @typescript-eslint/camelcase
      real_path: `/${lang !== 'default' ? lang : ''}${leaf.real_path}`.replace('//', '/'),
      children: leaf.children.map(attachStoryToLeaf(stories, lang, updatedBreadcrumbs)),
      breadcrumbs: updatedBreadcrumbs,
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

const flattenTree = (el: StoryblokNodeTree): StoryblokNodeTree[] => (
  [el, ...el.children.flatMap(flattenTree)]
);

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
  getBreadcrumbs(uuid: string, tree: StoryblokNodeTree[]): Breadcrumb[] {
    const { breadcrumbs } = tree
      .flatMap(flattenTree)
      .find((el) => el.uuid === uuid) || { breadcrumbs: undefined };

    return Array.isArray(breadcrumbs)
      ? breadcrumbs.filter((el) => el.label !== undefined && el.href !== undefined)
      : [];
  },
  async getContactPage(lang: string): Promise<StoryData> {
    /* eslint-disable @typescript-eslint/camelcase */
    const queryOptions = {
      with_tag: this.navigationContactTag[0],
      ...(lang !== 'default' && { starts_with: `${lang}/*` }),
    };
    /* eslint-enable @typescript-eslint/camelcase */
    const { data } = await this.storyblokClient.get('cdn/stories/', queryOptions);
    const contactPage = data.stories[0];

    if (contactPage) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      contactPage.full_slug = `/${contactPage?.full_slug}`.replace('//', '/');
    }
    return contactPage;
  },
};
