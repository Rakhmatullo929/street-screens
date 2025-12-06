import { Helmet } from 'react-helmet-async';

import { CampaignEditView } from 'src/sections/campaigns/view';

export default function CampaignEditPage() {
  return (
    <>
      <Helmet>
        <title>Edit Campaign | Billboard Management Platform</title>
      </Helmet>

      <CampaignEditView />
    </>
  );
}

