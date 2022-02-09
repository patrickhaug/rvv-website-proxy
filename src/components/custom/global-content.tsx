import { useStaticQuery, graphql } from 'gatsby';
import React, { ReactType } from 'react';
import { StringService } from '../../services';

const CustomComponent = 'rcm-global-content' as ReactType;

export const RcmGlobalContent = (props: unknown): JSX.Element => {
  const data = useStaticQuery(graphql`
    query SbImages {
      fundImages {
        internal {
          content
        }
      }
    }
  `);

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
