import React from 'react';
import ReactDOM from 'react-dom';

// build time (node context) does not have document defined.
const modal = typeof document !== 'undefined' ? document.getElementById('global-modal') : null;

const Modal = 'rcm-country-switch-modal' as React.ElementType;
const SLUG_PREFIX = 'RCM';

const buildCompleteSlug = ({
  countryCode,
  locale,
  pageSlug,
}: {
  countryCode: string;
  locale: string;
  pageSlug: string;
}): string => `${SLUG_PREFIX}${countryCode.toUpperCase()}-${locale}/${pageSlug}`;

const MOCKED_COUNTRY_CONFIG = [
  {
    code: 'at',
    defaultSlug: 'retail/unsere-vision/unsere-vision',
    locales: ['de', 'en', 'it'],
  },
];

export const RcmCountrySwitchModal = (): JSX.Element => (
  <>
    {ReactDOM.createPortal(<Modal
      // missing: dynamic image
      image-src='https://picsum.photos/1500/2000'
      // missing: translation
      headline='Choose your country'
      // missing: translation
      intro-text='Lorem ipsum dolor sit amet.'
      countries={
        JSON.stringify(MOCKED_COUNTRY_CONFIG.map((country) => ({
          value: country.code,
          // missing: translation
          label: country.code,
          href: buildCompleteSlug({
            countryCode: country.code,
            locale: country.locales[0],
            pageSlug: country.defaultSlug,
          }),
        })))
      }/>, modal)}
  </>
);
