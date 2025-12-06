import { Helmet } from 'react-helmet-async';

import AdsManagerView from 'src/sections/ads-manager/view/ads-manager-view';

export default function AdsManagerPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: (PROJECT NAME) Manager</title>
      </Helmet>

      <AdsManagerView />
    </>
  );
}
