import { Navigation } from './navigation';
import { NavigationItem } from './navigation-item';
import { Page } from './page';
import { SEO } from './seo';
import { gridComponents } from './grid';
import { RocheRichtext } from './richtext';

// eslint-disable-next-line import/no-default-export
export default {
  Navigation,
  NavigationItem,
  Page,
  SEO,
  RocheRichtext,
  ...gridComponents,
};
