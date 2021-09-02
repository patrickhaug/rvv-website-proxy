import { useEffect, useState } from 'react';
import { Default } from '../default';
import { AnyProps } from '../types';

const FUNDS_API_URL = 'https://1xe0hbssol.execute-api.eu-west-1.amazonaws.com/dev/reports';

interface FundsResponse {
  information: {
    reportname: string;
    reportid: string;
  };
  header: {
    row: {
      col: {
        value: string;
        id: string;
      }[];
    }[];
  };
  data: {
    row: {
      col: {
        value: string;
        id: string;
      }[];
    }[];
  };
}

const MockedFundsList = ({ blok, ...rest }: AnyProps): JSX.Element => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  // eslint-disable-next-line compat/compat
  const fetchAllFunds = (): Promise<FundsResponse> => fetch(FUNDS_API_URL).then(
    (response) => response.json(),
  );

  useEffect(() => {
    fetchAllFunds().then((funds) => {
      setHeaders(funds.header.row[0].col.map((colData) => colData.value));
      setRows(funds.data.row.map((rowData) => rowData.col.map((colData) => colData.value)));
    });
  }, []);

  return Default({
    blok: {
      ...blok,
      component: 'rcm-responsive-table',
      table: undefined,
      headers: JSON.stringify(headers),
      rows: JSON.stringify(rows),
      sortable: true,
      filterable: true,
    },
    ...rest,
  });
};

export const mockedFundsList = {
  'rcm-mocked-funds-list': MockedFundsList,
};
