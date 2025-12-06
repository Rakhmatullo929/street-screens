import { Helmet } from 'react-helmet-async';

import { ScreenContentView } from 'src/sections/screen-manager/view';

export default function ScreenContentPage() {
  return (
    <>
      <Helmet>
        <title>Screen Content | DOOH Platform</title>
      </Helmet>

      <ScreenContentView />
    </>
  );
}
