import { SbEditableContent } from 'storyblok-react';

export interface Props<T = {}> {
  blok: T & SbEditableContent;
  getComponent: (type: string) => AnyComponent;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyProps = Props<any>;

export type Component<T = {}> = (props: Props<T>) => JSX.Element;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyComponent = Component<any>;
