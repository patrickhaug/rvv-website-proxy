import React, { ReactType } from 'react';
import { GlobalConfigProps, StringService } from '../../services';

const CustomComponent = 'roche-global-config' as ReactType;

export const RocheGlobalConfig = (props: GlobalConfigProps): JSX.Element => {
  const newProps = Object.keys(props).reduce((accumulator, prop) => ({
    ...accumulator,
    [`data-${StringService.camelToKebab(prop)}`]: props[prop],
  }), {});

  return (
    <CustomComponent {...newProps}></CustomComponent>
  );
};
