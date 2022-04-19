import React from 'react';
import { AnyProps } from '../types';
import { flattenProps } from '../../services/component-mapping';

const GenericLinkComponents = {
  'rvv-generic-link': {
  },
  'rvv-download-link': {
    props: {
      target: '_blank',
      icon: 'download',
      'underline-color': 'var(--colors-primary-base)',
    },
    mappings: {
      url: 'src', // type: asset
    },
  },
};

const getrvvGenericLink = (comp): React.ElementType => {
  // giving the function a name is just to have named mappings for debugging purposes
  const rvvGenericLink = ({ blok, slot }: AnyProps): JSX.Element => React.createElement(
    'rvv-generic-link',
    { ...flattenProps(comp, blok), ...comp.props, slot },
  );

  return rvvGenericLink;
};

export const rvvGenericLinkComponents = Object.keys(GenericLinkComponents)
  .reduce((accumulator, componentName) => ({
    ...accumulator,
    [componentName]: getrvvGenericLink(GenericLinkComponents[componentName]),
  }), {});
