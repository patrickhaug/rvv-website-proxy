import React, { useEffect, useState } from 'react';

const FUNDS_API_URL = 'https://1xe0hbssol.execute-api.eu-west-1.amazonaws.com/dev/reports';

interface FundsResponse {
  information: {
    reportname: string;
    reportid: string;
  };
}

const MockedFundsDetails = (): JSX.Element => {
  const [id, setId] = useState<string>();
  const [data, setData] = useState<FundsResponse>(undefined);

  // eslint-disable-next-line compat/compat
  const fetchAllFunds = (fundId: string): Promise<FundsResponse> => fetch(`${FUNDS_API_URL}/${fundId}`).then(
    (response) => response.json(),
  );

  useEffect(() => {
    if (id) {
      fetchAllFunds(id).then((funds) => {
        setData(funds);
      }).catch(() => {
        setData(undefined);
      });
    } else {
      setData(undefined);
    }
  }, [id]);

  return <>
    <input
      onChange={(e) => setId(e.target.value)}
      placeholder='Report ID'
    ></input>
    <div>
      {!data ? <p>Keine Daten gefunden</p> : <div>
        <h2>{data.information.reportname}</h2>
        <h4>{data.information.reportid}</h4>
      </div>}
    </div>
  </>;
};

export const mockedFundsDetails = {
  'rvv-mocked-funds-details': MockedFundsDetails,
};
