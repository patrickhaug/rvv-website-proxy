import { useStaticQuery, graphql } from 'gatsby';
import React, { ReactType } from 'react';
import { StringService } from '../../services';

const CustomComponent = 'rvv-global-content' as ReactType;

export const rvvGlobalContent = (props: unknown): JSX.Element => {
  const data = {}

  const newProps = Object.keys(props).reduce(
    (accumulator, prop) => ({
      ...accumulator,
      [`data-${StringService.camelToKebab(prop)}`]: props[prop],
    }),
    {},
  );

  return (
    <CustomComponent
      {...newProps}
      fund-images={data.fundImages.internal.content}
    ></CustomComponent>
  );
};
