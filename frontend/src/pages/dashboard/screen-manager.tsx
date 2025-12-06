import { Helmet } from 'react-helmet-async';

import ScreenManagerView from 'src/sections/screen-manager/view/screen-manager-view';

export default function ScreenManagerPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: Screen Manager</title>
      </Helmet>

      <ScreenManagerView />
    </>
  );
}
