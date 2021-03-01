import { contentEntries } from './content-entries';
import { RocheGlobalConfig } from './global-config';
import { RocheNavigation } from './navigation';
import { gridComponents } from './grid';
import { RocheRichtext } from './richtext';
import { forms } from './forms';
import { responsiveTable } from './responsive-table';
// import { SEO } from './seo';

// eslint-disable-next-line import/no-default-export
export default {
  ...contentEntries,
  RocheGlobalConfig,
  ...gridComponents,
  RocheNavigation,
  RocheRichtext,
  ...forms,
  ...responsiveTable,
  // SEO,
};
