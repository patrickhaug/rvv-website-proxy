import React from 'react';
import ReactDOM from 'react-dom';
import { GlobalContent } from '../../services';

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

const convertCountryConfigs = (content: GlobalContent) => Object.keys(content.countryConfigs)
  .map((key) => ({
    value: key,
    label: content.countries[key],
    href: buildCompleteSlug({
      countryCode: key,
      locale: content.countryConfigs[key].locales.split(',')[0],
      pageSlug: content.countryConfigs[key].defaultSlug,
    }),
  }));

export const RcmCountrySwitchModal = ({
  globalContent,
}: {
  globalContent: GlobalContent;
}): JSX.Element => <>
  {ReactDOM.createPortal(<Modal
    image-src={globalContent.countrySwitchModal.imageSrc}
    headline={globalContent.countrySwitchModal.headline}
    intro-text={globalContent.countrySwitchModal.introText}
    countries={JSON.stringify(convertCountryConfigs(globalContent))}/>, modal)}
</>;
