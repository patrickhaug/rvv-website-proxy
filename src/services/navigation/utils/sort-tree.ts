export interface SortableItem {
  position: number;
  children?: SortableItem[];
}

const sortByPosition = (a: SortableItem, b: SortableItem): number => a.position - b.position;

export const sortTree = (array: SortableItem[]): void => {
  array.sort(sortByPosition);
  array.forEach((node) => sortTree(node.children));
};
