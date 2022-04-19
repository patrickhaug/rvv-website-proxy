import { Default } from '../default';
import { AnyProps } from '../types';

const rvvResponsiveTable = ({ blok, ...rest }: AnyProps): JSX.Element => {
  // map headers
  const headersArray = blok.table.thead?.map((tableHeader) => tableHeader.value);

  // map rows
  const rowsArray = [];
  if (blok.table.tbody) {
    blok.table.tbody.forEach((tableRow) => {
      rowsArray.push(tableRow.body?.map((tableCell) => tableCell.value));
    });
  }

  return Default({
    blok: {
      ...blok,
      table: undefined,
      headers: JSON.stringify(headersArray),
      rows: JSON.stringify(rowsArray),
      is_aligned: true,
    },
    ...rest,
  });
};

export const responsiveTable = {
  'rvv-responsive-table': rvvResponsiveTable,
};
