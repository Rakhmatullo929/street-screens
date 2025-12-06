import {forwardRef} from 'react';


import Link from '@mui/material/Link';
import Box, {BoxProps} from '@mui/material/Box';

import {RouterLink} from 'src/routes/components';

export interface LogoProps extends BoxProps {
    disabledLink?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
    ({disabledLink = false, sx, ...other}, ref) => {


        const logo = (
            <Box
                ref={ref}
                component="div"
                sx={{
                    display: 'inline-flex',
                    ...sx,
                }}
                {...other}
            >
                <Box
                    component="img"
                    src="/logo/logo_single.png"
                    sx={{
                        height: 36,
                        width: 'auto',
                        cursor: 'pointer'
                    }}
                />
            </Box>
        );

        if (disabledLink) {
            return logo;
        }

        return (
            <Link component={RouterLink} href="/" sx={{display: 'contents'}}>
                {logo}
            </Link>
        );
    }
);

export default Logo;
