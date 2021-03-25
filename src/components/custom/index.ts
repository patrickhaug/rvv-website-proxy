import { contentEntries } from './content-entries';
import { RcmGlobalConfig } from './global-config';
import { RcmNavigation } from './navigation';
import { gridComponents } from './grid';
import { RcmRichtext } from './richtext';
import { forms } from './forms';
import { responsiveTable } from './responsive-table';
import { mockedFundsList } from './mocked-funds-list';
import { rcmGenericLinkComponents } from './generic-link';
// import { SEO } from './seo';

// eslint-disable-next-line import/no-default-export
export default {
  ...contentEntries,
  RcmGlobalConfig,
  ...gridComponents,
  RcmNavigation,
  RcmRichtext,
  ...rcmGenericLinkComponents,
  ...forms,
  ...responsiveTable,
  ...mockedFundsList,
  // SEO,
};
