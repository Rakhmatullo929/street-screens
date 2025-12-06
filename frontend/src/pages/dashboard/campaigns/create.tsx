import { Helmet } from 'react-helmet-async';

import { CampaignCreateView } from 'src/sections/campaigns/view';

export default function CreateCampaignPage() {
  return (
    <>
      <Helmet>
        <title>Create Campaign | Billboard Management Platform</title>
      </Helmet>

      <CampaignCreateView />
    </>
  );
}
