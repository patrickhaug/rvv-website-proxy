"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortTree = void 0;
const sortByPosition = (a, b) => a.position - b.position;
const sortTree = (array) => {
    array.sort(sortByPosition);
    array.forEach((node) => (0, exports.sortTree)(node.children));
};
exports.sortTree = sortTree;
