import React from 'react';
import ReactDOM from 'react-dom';
import { GlobalContent, Country } from '../../services';

// build time (node context) does not have document defined.
const modal = typeof document !== 'undefined' ? document.getElementById('global-modal') : null;

const Modal = 'rcm-user-switch-modal' as React.ElementType;

const convertUserConfigs = (content: GlobalContent | undefined): {
  value: string;
  description: string;
  label: string;
  href: string;
}[] => (content?.userTypeConfigs ? Object.keys(content.userTypeConfigs)
  .map((key) => ({
    value: key,
    label: content.userTypeConfigs[key].label,
    href: content.userTypeConfigs[key].href,
    description: content.userTypeConfigs[key].description,
  })) : []);

export const RcmUserSwitchModal = ({
  globalContent,
  inArticle,
  country,
  userTypeFromSlug,
}: {
  globalContent: GlobalContent;
  inArticle: boolean;
  country: Country;
  userTypeFromSlug: string;
}): JSX.Element => (
  <>
    {modal
      && ReactDOM.createPortal(
        <Modal
          country-description={
            globalContent?.userSwitchModal?.countryDescription
          }
          country-label={globalContent?.countryNames[country] || ''}
          country-switch-label={
            globalContent?.userSwitchModal?.countrySwitchLabel
          }
          country-value={country}
          image-src={globalContent?.userSwitchModal?.imageSrc}
          headline={globalContent?.userSwitchModal?.headline}
          intro-text={globalContent?.userSwitchModal?.introText}
          footnote-text={globalContent?.footer?.infoText}
          checkbox-label={globalContent?.userSwitchModal?.checkboxLabel}
          disclaimer={globalContent?.userSwitchModal?.disclaimer}
          users={JSON.stringify(convertUserConfigs(globalContent))}
          in-article={inArticle}
          link-text={globalContent?.userSwitchModal?.linkLabel}
          link={globalContent?.userSwitchModal?.linkHref}
          retail-headline={
            globalContent?.userSwitchModal?.privatAnlegerHeadline
          }
          retail-text={globalContent?.userSwitchModal?.privatAnlegerText}
          institutionell-headline={
            globalContent?.userSwitchModal?.institutionellHeadline
          }
          institutionell-text={
            globalContent?.userSwitchModal?.institutionellText
          }
          lichtenstein-headline={
            globalContent?.userSwitchModal?.lichtensteinHeadline
          }
          lichtenstein-text={globalContent?.userSwitchModal?.lichtensteinText}
          user-type-from-slug={userTypeFromSlug}
          go-to={globalContent?.userSwitchModal?.goToSite}
        />,
        modal,
      )}
  </>
);
