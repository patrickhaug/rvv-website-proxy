import React from 'react';
import { AnyProps } from '../types';
import { flattenProps } from '../../services/component-mapping';
import { asset } from '../props/asset';

const GenericLinkComponents = {
  'rcm-generic-link': {
  },
  'rcm-download-link': {
    props: {
      target: '_blank',
      icon: 'download',
    },
  },
};

const getRcmGenericLink = (compName: string): React.ElementType => {
  const comp = GenericLinkComponents[compName];
  // giving the function a name is just to have named mappings for debugging purposes
  const RcmGenericDownloadLink = ({ blok, slot }: AnyProps): JSX.Element => React.createElement(
    'rcm-generic-link',
    {
      ...flattenProps(comp, blok), ...comp.props, ...asset('url', blok.url[0].asset), slot,
    },
  );
  const RcmGenericLink = ({ blok, slot }: AnyProps): JSX.Element => React.createElement(
    'rcm-generic-link',
    {
      ...flattenProps(comp, blok), ...comp.props, slot,
    },
  );

  if (compName === 'rcm-download-link') {
    return RcmGenericDownloadLink;
  }

  return RcmGenericLink;
};

export const rcmGenericLinkComponents = Object.keys(GenericLinkComponents)
  .reduce((accumulator, componentName) => ({
    ...accumulator,
    [componentName]: getRcmGenericLink(componentName),
  }), {});
