import {Helmet} from 'react-helmet-async';

import {AboutView} from 'src/sections/about/view';

export default function AboutPage() {
    return (
        <>
            <Helmet>
                <title>About StreetScreen – Smart Screen Network Platform</title>
            </Helmet>

            <AboutView/>
        </>
    );
}
