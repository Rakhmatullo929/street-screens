import { Helmet } from 'react-helmet-async';

import { ScreenDetailsView } from 'src/sections/screen-manager/view';

export default function ScreenDetailsPage() {
  return (
    <>
      <Helmet>
        <title>Screen Details | Billboard Management Platform</title>
      </Helmet>

      <ScreenDetailsView />
    </>
  );
}

