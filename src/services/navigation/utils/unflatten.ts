interface RequiredKeys {
  id: number;
  parent_id: number;
}

export const unflatten = (arr: RequiredKeys[]): RequiredKeys[] => {
  const tree = [];
  const mappedArr = {};
  let arrElem;
  let mappedElem;

  // eslint-disable-next-line no-plusplus
  for (let i = 0, len = arr.length; i < len; i++) {
    arrElem = arr[i];
    mappedArr[arrElem.id] = arrElem;
    mappedArr[arrElem.id].children = [];
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const id in mappedArr) {
    // eslint-disable-next-line no-prototype-builtins
    if (mappedArr.hasOwnProperty(id)) {
      mappedElem = mappedArr[id];
      // If the element is not at the root level, add it to its parent array of children.
      if (mappedElem.parent_id) {
        mappedArr[mappedElem.parent_id].children.push(mappedElem);
      } else {
        // If the element is at the root level, add it to first level elements array.
        tree.push(mappedElem);
      }
    }
  }
  return tree;
};
