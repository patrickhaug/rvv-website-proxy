import React from 'react';
import { Helmet } from 'react-helmet';

type GoogleTagManagerProps = {
  googleTagManagerId: string;
};

export const GoogleTagManager = ({ googleTagManagerId }: GoogleTagManagerProps): JSX.Element => {
  if (!googleTagManagerId) {
    return null;
  }
  return (
    <Helmet>
      {/* TODO: add cookie for tracking */}
      <script type="text/javascript">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${googleTagManagerId}');

          window.dataLayer = window.dataLayer || [];
        `}</script>
    </Helmet>
  );
};
