import { Default } from '../default';
import { AnyProps } from '../types';

const RcmResponsiveTable = ({ blok, ...rest }: AnyProps): JSX.Element => {
  // map headers
  const headersArray = blok.table.thead.map((tableHeader) => tableHeader.value);

  // map rows
  const rowsArray = [];
  blok.table.tbody.forEach((tableRow) => {
    rowsArray.push(tableRow.body.map((tableCell) => tableCell.value));
  });

  return Default({
    blok: {
      ...blok,
      table: undefined,
      headers: JSON.stringify(headersArray),
      rows: JSON.stringify(rowsArray),
    },
    ...rest,
  });
};

export const responsiveTable = {
  'rcm-responsive-table': RcmResponsiveTable,
};
