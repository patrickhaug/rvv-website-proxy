import React from 'react';
import ReactDOM from 'react-dom';
import { GlobalContent } from '../../services';

// build time (node context) does not have document defined.
const modal = typeof document !== 'undefined' ? document.getElementById('global-modal') : null;

const Modal = 'rcm-country-switch-modal' as React.ElementType;

const convertCountryConfigs = (content: GlobalContent): {
  value: string;
  label: string;
  href: string;
}[] => (content?.countryConfigs ? Object.keys(content.countryConfigs)
  .map((key) => ({
    value: key,
    label: content.countryNames[key],
    href: content.countryConfigs[key].defaultSlug,
  })) : []);

export const RcmCountrySwitchModal = ({
  globalContent,
}: {
  globalContent: GlobalContent;
}): JSX.Element => <>
  {modal && ReactDOM.createPortal(<Modal
    image-src={globalContent?.countrySwitchModal?.imageSrc}
    headline={globalContent?.countrySwitchModal?.headline}
    intro-text={globalContent?.countrySwitchModal?.introText}
    countries={JSON.stringify(convertCountryConfigs(globalContent))}/>, modal)}
</>;
