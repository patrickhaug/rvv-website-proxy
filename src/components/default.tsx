import React from 'react';
import { ConversionService } from '../services';
import { AnyProps } from './types';

export const Default = ({ blok }: AnyProps): JSX.Element => {
  const props = Object.keys(blok)
    .filter((key) => key && key[0] !== '_' && key !== 'component')
    .reduce((accumulator, key) => ({
      ...accumulator,
      [key]: blok[key],
    }), {});

  const CustomComponent = ConversionService.camelToKebab(blok.component);
  return (
    <CustomComponent {...props}></CustomComponent>
  );
};
