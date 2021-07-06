import React, { ReactType } from 'react';
import { StringService } from '../../services';

const CustomComponent = 'rcm-global-content' as ReactType;

export const RcmGlobalContent = (props: unknown): JSX.Element => {
  const newProps = Object.keys(props).reduce((accumulator, prop) => ({
    ...accumulator,
    [`data-${StringService.camelToKebab(prop)}`]: props[prop],
  }), {});

  return (
    <CustomComponent {...newProps}></CustomComponent>
  );
};
