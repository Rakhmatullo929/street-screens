
import Box from '@mui/material/Box';

import {usePathname} from 'src/routes/hook';

import Footer from './footer';
import Header from './header';

type Props = {
    children: React.ReactNode;
};

export default function MainLayout({children}: Props) {
    const pathname = usePathname();
    const hideChrome = /^\/serve\/.+/.test(pathname);

    const isHome = pathname === '/';

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: 1}}>

            {!hideChrome && <Header/>}

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    ...(!isHome && {
                        pt: {xs: 8, md: 10},
                    }),
                }}
            >
                {children}
            </Box>

            {!hideChrome && <Footer/>}
        </Box>
    );
}
