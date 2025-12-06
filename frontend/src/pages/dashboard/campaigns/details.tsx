import { Helmet } from 'react-helmet-async';

import { CampaignDetailsView } from 'src/sections/campaigns/view';

export default function CampaignDetailsPage() {
  return (
    <>
      <Helmet>
        <title>Campaign Details | Billboard Management Platform</title>
      </Helmet>

      <CampaignDetailsView />
    </>
  );
}

