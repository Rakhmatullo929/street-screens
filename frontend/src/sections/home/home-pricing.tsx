import {m} from 'framer-motion';

import {alpha} from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack, {StackProps} from '@mui/material/Stack';

import SvgColor from 'src/components/svg-color';
import Iconify from 'src/components/iconify';
import {varFade, MotionViewport} from 'src/components/animate';

import {paths} from 'src/routes/paths';
import {RouterLink} from 'src/routes/components';

import {_homePlans} from 'src/_mock';

export default function HomePricing() {

    const renderDescription = (
        <Stack spacing={3} sx={{mb: 8, textAlign: 'center'}}>
            <m.div variants={varFade().inUp}>
                <Typography component="div" variant="overline" sx={{mb: 2, color: 'text.disabled'}}>
                    StreetScreen plans
                </Typography>
            </m.div>

            <m.div variants={varFade().inDown}>
                <Typography variant="h2">
                    Plans for any <br/> screen network size
                </Typography>
            </m.div>

            <m.div variants={varFade().inDown}>
                <Typography sx={{color: 'text.secondary'}}>
                    Choose a StreetScreen plan that fits your network — from a few city screens to nationwide coverage.
                </Typography>
            </m.div>
        </Stack>
    );


    const renderContent = (
        <>
            <Box
                sx={{
                    display: 'grid',
                    gap: {xs: 3, md: 4},
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(3, 1fr)',
                    },
                }}
            >
                {_homePlans.map((plan) => (
                    <m.div key={plan.license} variants={varFade().inUp}>
                        <PlanCard
                            plan={plan}
                            sx={{
                                height: '100%',
                                borderRadius: 2,
                                border: (theme) => `dashed 1px ${theme.palette.divider}`,
                                bgcolor: 'background.paper',
                            }}
                        />
                    </m.div>
                ))}
            </Box>

            <m.div variants={varFade().in}>
                <Box sx={{textAlign: 'center', mt: 8}}>
                    <m.div variants={varFade().inDown}>
                        <Typography variant="h4">Ready to get started?</Typography>
                    </m.div>

                    <m.div variants={varFade().inDown}>
                        <Typography sx={{mt: 2, mb: 5, color: 'text.secondary'}}>
                            Launch your first StreetScreen campaign in minutes with our all-in-one platform.
                        </Typography>
                    </m.div>

                    <m.div variants={varFade().inUp}>
                        <Button
                            component={RouterLink}
                            href={paths.dashboard.root}
                            size="large"
                            variant="contained"
                            startIcon={<Iconify icon="solar:rocket-2-bold-duotone" width={24}/>}
                        >
                            Get Started
                        </Button>
                    </m.div>
                </Box>
            </m.div>

        </>
    );

    return (
        <Box
            sx={{
                py: {xs: 10, md: 15},
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            }}
        >
            <Container component={MotionViewport}>
                {renderDescription}

                {renderContent}
            </Container>
        </Box>
    );
}

interface PlanCardProps extends StackProps {
    plan: {
        license: string;
        commons: string[];
        options: string[];
        icons: string[];
    };
}

function PlanCard({plan, sx, ...other}: PlanCardProps) {
    const {license, commons, options} = plan;

    return (
        <Stack spacing={4} sx={{p: 5, textAlign: 'center'}} {...other}>
            <Stack spacing={2}>
                <Typography variant="overline" component="div" sx={{color: 'text.disabled'}}>
                    Solution
                </Typography>
                <Typography variant="h4">{license}</Typography>
            </Stack>

            <Stack spacing={2.5}>
                {commons.map((option) => (
                    <Stack key={option} spacing={1} direction="row" alignItems="center">
                        <Iconify icon="eva:checkmark-fill" width={16} sx={{color: 'primary.main'}}/>
                        <Typography variant="body2">{option}</Typography>
                    </Stack>
                ))}

                <Divider sx={{borderStyle: 'dashed'}}/>

                {options.map((option) => (
                    <Stack key={option} spacing={1} direction="row" alignItems="center">
                        <Iconify icon="eva:checkmark-fill" width={16} sx={{color: 'primary.main'}}/>
                        <Typography variant="body2">{option}</Typography>
                    </Stack>
                ))}
            </Stack>
        </Stack>
    );
}
