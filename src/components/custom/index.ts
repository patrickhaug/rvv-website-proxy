import { contentEntries } from './content-entries';
import { RcmGlobalConfig } from './global-config';
import { RcmGlobalContent } from './global-content';
import { RcmNavigation } from './navigation';
import { RcmFooter } from './footer';
import { gridComponents } from './grid';
import { RcmRichtext } from './richtext';
import { forms } from './forms';
import { responsiveTable } from './responsive-table';
import { mockedFundsList } from './mocked-funds-list';
import { rcmGenericLinkComponents } from './generic-link';
import { mockedFundsDetails } from './mocked-funds-details';
// import { SEO } from './seo';

// eslint-disable-next-line import/no-default-export
export default {
  ...contentEntries,
  RcmGlobalConfig,
  RcmGlobalContent,
  ...gridComponents,
  RcmNavigation,
  RcmFooter,
  RcmRichtext,
  ...rcmGenericLinkComponents,
  ...forms,
  ...responsiveTable,
  ...mockedFundsList,
  ...mockedFundsDetails,
  // SEO,
};
