import React, { ReactType, useEffect } from 'react';
import { GlobalConfigProps, StringService, LanguageService } from '../../services';

const CustomComponent = 'rcm-global-config' as ReactType;

export const RcmGlobalConfig = (props: GlobalConfigProps): JSX.Element => {
  useEffect(() => {
    document.documentElement.lang = props.locale || LanguageService.defaultLocale;
  });

  const newProps = Object.keys(props).reduce((accumulator, prop) => ({
    ...accumulator,
    [`data-${StringService.camelToKebab(prop)}`]: props[prop],
  }), {});

  return (
    <CustomComponent {...newProps}></CustomComponent>
  );
};
