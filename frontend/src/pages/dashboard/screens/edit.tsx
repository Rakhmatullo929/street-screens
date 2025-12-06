import { Helmet } from 'react-helmet-async';

import { ScreenEditView } from 'src/sections/screen-manager/view';

export default function ScreenEditPage() {
  return (
    <>
      <Helmet>
        <title>Edit Screen | Billboard Management Platform</title>
      </Helmet>

      <ScreenEditView />
    </>
  );
}

