import { Helmet } from 'react-helmet-async';

import { HomeView } from 'src/sections/home/view';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Billboard Management Platform - Digital Advertising Control System</title>
      </Helmet>

      <HomeView />
    </>
  );
}
