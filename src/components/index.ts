import { ConversionService } from '../services';
import CustomComponents from './custom';
import { Default } from './default';
import { AnyComponent } from './types';

const customComponents: Record<string, AnyComponent> = Object
  .keys(CustomComponents)
  .reduce((accumulator, componentName) => ({
    ...accumulator,
    [ConversionService.camelToKebab(componentName)]: CustomComponents[componentName],
  }), {});

export const getComponent = (type: (keyof typeof customComponents)): AnyComponent => {
  if (typeof customComponents[type] === 'undefined') {
    return Default;
  }
  return customComponents[type];
};
