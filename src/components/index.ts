import { StringService } from '../services';
import CustomComponents from './custom';
import { Default } from './default';
import { AnyComponent } from './types';

export * from './helpers';

const customComponents: Record<string, AnyComponent> = Object
  .keys(CustomComponents)
  .reduce((accumulator, componentName) => ({
    ...accumulator,
    [StringService.camelToKebab(componentName)]: CustomComponents[componentName],
  }), {});

export const getComponent = (type: (keyof typeof customComponents)): AnyComponent => {
  if (typeof customComponents[type] === 'undefined') {
    return Default;
  }
  return customComponents[type];
};
