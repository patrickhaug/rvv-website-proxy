import { contentEntries } from './content-entries';
import { rvvGlobalConfig } from './global-config';
import { rvvGlobalContent } from './global-content';
import { rvvNavigation } from './navigation';
import { rvvFooter } from './footer';
import { gridComponents } from './grid';
import { rvvRichtext } from './richtext';
import { rvvLegalText } from './legal-text';
import { rvvEditorialTextBlock } from './editorial-text-block';
import { forms } from './forms';
import { responsiveTable } from './responsive-table';
import { mockedFundsList } from './mocked-funds-list';
import { rvvGenericLinkComponents } from './generic-link';
import { mockedFundsDetails } from './mocked-funds-details';
// import { SEO } from './seo';

// eslint-disable-next-line import/no-default-export
export default {
  ...contentEntries,
  rvvGlobalConfig,
  rvvGlobalContent,
  ...gridComponents,
  rvvNavigation,
  rvvFooter,
  rvvRichtext,
  rvvLegalText,
  rvvEditorialTextBlock,
  ...rvvGenericLinkComponents,
  ...forms,
  ...responsiveTable,
  ...mockedFundsList,
  ...mockedFundsDetails,
  // SEO,
};
