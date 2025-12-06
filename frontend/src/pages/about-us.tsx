import { Helmet } from 'react-helmet-async';

import { AboutView } from 'src/sections/about/view';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Us - Billboard Management Platform</title>
      </Helmet>

      <AboutView />
    </>
  );
}
