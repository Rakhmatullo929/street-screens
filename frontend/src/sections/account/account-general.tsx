import * as Yup from 'yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import MenuItem from '@mui/material/MenuItem';

import { useAuthContext } from 'src/auth/hooks/use-auth-context';
import { useApiMutation } from 'src/hooks/use-api-mutation';

import { IUserAccount } from 'src/types/user';
import { USER_TYPES } from 'src/utils/axios';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFSelect } from 'src/components/hook-form';

type FormValuesProps = {
    email: string;
    type_user: string;
};

export default function AccountGeneral() {
    const { enqueueSnackbar } = useSnackbar();
    const { user } = useAuthContext();

    const UpdateUserSchema = Yup.object().shape({
        email: Yup.string().required('Email is required').email('Email must be a valid email address'),
        type_user: Yup.string().required('User type is required'),
    });

    const defaultValues = {
        email: user?.email || '',
        type_user: user?.type_user || USER_TYPES.ADS_CLIENT,
    };

    const methods = useForm<FormValuesProps>({
        resolver: yupResolver(UpdateUserSchema),
        defaultValues,
    });

    const {
        reset,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    // Reset form when user data changes
    useEffect(() => {
        reset({
            email: user?.email || '',
            type_user: user?.type_user || USER_TYPES.ADS_CLIENT,
        });
    }, [user, reset]);

    // Update user API mutation
    const { mutate: updateUser, loading: updateLoading } = useApiMutation({
        url: 'users/user/',
        method: 'PATCH',
        onSuccess: () => {
            enqueueSnackbar('Profile updated successfully!');
        },
        onError: (error) => {
            enqueueSnackbar(error?.message || 'Failed to update profile', { variant: 'error' });
        },
    });

    const onSubmit = useCallback(
        async (data: FormValuesProps) => {
            try {

                const updateData = {
                    type_user: data.type_user,
                };

                await updateUser(updateData);
            } catch (error) {
                console.error('Failed to update user:', error);
            }
        },
        [updateUser]
    );

    return (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
                <Grid xs={12}>
                    <Card sx={{ p: 3 }}>
                        <Box
                            rowGap={3}
                            columnGap={2}
                            display="grid"
                            gridTemplateColumns={{
                                xs: 'repeat(1, 1fr)',
                            }}
                        >
                            <RHFTextField name="email" label="Email Address" disabled />
                            <RHFSelect name="type_user" label="User Type">
                                <MenuItem value={USER_TYPES.ADS_CLIENT}>StreetScreen Client</MenuItem>
                                <MenuItem value={USER_TYPES.ADS_MANAGER}>StreetScreen Manager</MenuItem>
                            </RHFSelect>
                        </Box>

                        <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
                            <LoadingButton
                                type="submit"
                                variant="contained"
                                loading={updateLoading || isSubmitting}
                            >
                                Save Changes
                            </LoadingButton>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>
        </FormProvider>
    );
}
