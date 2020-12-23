import { useEffect } from 'react';
import { PageProps } from 'gatsby';

interface NotFoundPageProps extends PageProps {
  pageContext: {
    localeList: string[];
  };
}

const getLocaleAware404Path = (location, localeList: string[]): string => {
  const locale = location.pathname.split('/')[1];

  if (!locale || !localeList.includes(locale)) {
    return '/404/';
  }

  return `/${locale}/404/`;
};

const NotFound = ({ location, navigate, pageContext }: NotFoundPageProps): JSX.Element => {
  useEffect(() => {
    const maskUrl = window.location.href;

    navigate(
      getLocaleAware404Path(location, pageContext.localeList),
      {
        replace: false,
        state: { maskUrl },
      },
    );
  }, []);

  return null;
};

// eslint-disable-next-line import/no-default-export
export default NotFound;
