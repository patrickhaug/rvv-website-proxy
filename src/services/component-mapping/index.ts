import React from 'react';
import get from 'lodash.get';
import { AnyProps } from '../../components/types';
import { getMappedProps } from '../../components/props';

export const flattenProps = (comp, blok): React.ClassAttributes<AnyProps> => Object.keys(blok)
  .reduce((accumulator, propName) => {
    const props = {
      ...accumulator,
      ...(propName.indexOf('_') !== 0 ? getMappedProps(propName, blok[propName]) : { [propName]: blok[propName] }),
    };
    return {
      ...props,
      // eslint-disable-next-line max-len

      [propName]: comp.mappings && comp.mappings[propName] && props[propName]
        ? get(JSON.parse(props[propName]), comp.mappings[propName])
        : props[propName],

    };
  }, {});
