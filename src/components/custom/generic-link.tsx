import React from 'react';
import { AnyProps } from '../types';
import { flattenProps } from '../../services/component-mapping';

const GenericLinkComponents = {
  'rcm-generic-link': {
  },
  'rcm-download-link': {
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

const getRcmGenericLink = (comp): React.ElementType => {
  // giving the function a name is just to have named mappings for debugging purposes
  const RcmGenericLink = ({ blok, slot }: AnyProps): JSX.Element => React.createElement(
    'rcm-generic-link',
    { ...flattenProps(comp, blok), ...comp.props, slot },
  );

  return RcmGenericLink;
};

export const rcmGenericLinkComponents = Object.keys(GenericLinkComponents)
  .reduce((accumulator, componentName) => ({
    ...accumulator,
    [componentName]: getRcmGenericLink(GenericLinkComponents[componentName]),
  }), {});
