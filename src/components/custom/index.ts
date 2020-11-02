import { Page } from './page';
import { RocheGlobalConfig } from './global-config';
import { RocheNavigation } from './navigation';
import { gridComponents } from './grid';
import { RocheRichtext } from './richtext';
import { forms } from './forms';
// import { SEO } from './seo';

// eslint-disable-next-line import/no-default-export
export default {
  Page,
  RocheGlobalConfig,
  ...gridComponents,
  RocheNavigation,
  RocheRichtext,
  ...forms,
  // SEO,
};
