import React from 'react';
import { ConversionService } from '../services';
import { AnyProps } from './types';

const shouldBePrinted = (value: unknown): boolean => !(
  value === null || value === undefined || value === false
);

const toHTMLAttribute = (value: unknown): string => (
  value instanceof Object ? JSON.stringify(value) : value.toString()
);

export const Default = ({ blok }: AnyProps): JSX.Element => {
  const props = Object.keys(blok)
    .filter((key) => key && key[0] !== '_' && key !== 'component')
    .reduce((accumulator, key) => ({
      ...accumulator,
      ...(shouldBePrinted(blok[key]) ? {
        [ConversionService.camelToKebab(key)]: toHTMLAttribute(blok[key]),
      } : {}),
    }), {});

  const CustomComponent = ConversionService.camelToKebab(blok.component);
  return (
    <CustomComponent {...props}></CustomComponent>
  );
};
