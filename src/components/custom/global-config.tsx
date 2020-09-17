import React, { ReactType } from 'react';
import { ConversionService } from '../../services';

const CustomComponent = 'roche-global-config' as ReactType;

export interface GlobalConfigProps {
  pageId: string;
  recaptchaKey: string;
}

export const RocheGlobalConfig = (props: GlobalConfigProps): JSX.Element => {
  const newProps = Object.keys(props).reduce((accumulator, prop) => ({
    ...accumulator,
    [`data-${ConversionService.camelToKebab(prop)}`]: props[prop],
  }), {});

  return (
    <CustomComponent {...newProps}></CustomComponent>
  );
};
