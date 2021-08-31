import { SbEditableContent } from 'storyblok-react';

export interface Props<T = Record<string, unknown>> {
  blok: T & SbEditableContent;
  getComponent: GetComponentType;
  slot?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyProps = Props<any>;

export type Component<T = Record<string, unknown>> = (props: Props<T>) => JSX.Element;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyComponent = Component<any>;

export type GetComponentType = (type: string) => AnyComponent;
