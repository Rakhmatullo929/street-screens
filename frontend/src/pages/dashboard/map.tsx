import { Helmet } from 'react-helmet-async';

import { BillboardMapView } from 'src/sections/map/view';

export default function BillboardMapPage() {
  return (
    <>
      <Helmet>
        <title>Screen Map - DOOH Platform</title>
      </Helmet>

      <BillboardMapView />
    </>
  );
}

