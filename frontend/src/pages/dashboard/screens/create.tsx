import { Helmet } from 'react-helmet-async';

import { ScreenCreateView } from 'src/sections/screen-manager/view';

export default function ScreenCreatePage() {
  return (
    <>
      <Helmet>
        <title>Add Screen | Billboard Management Platform</title>
      </Helmet>

      <ScreenCreateView />
    </>
  );
}

