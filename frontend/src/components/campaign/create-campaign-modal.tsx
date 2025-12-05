import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Stack,
  Typography,
  Box,
} from '@mui/material';

import Iconify from 'src/components/iconify';

const UZBEKISTAN_CITIES = [
  { label: 'Tashkent', value: 'tashkent' },
  { label: 'Samarkand', value: 'samarkand' },
  { label: 'Bukhara', value: 'bukhara' },
  { label: 'Andijan', value: 'andijan' },
  { label: 'Namangan', value: 'namangan' },
  { label: 'Fergana', value: 'fergana' },
  { label: 'Nukus', value: 'nukus' },
  { label: 'Karshi', value: 'karshi' },
  { label: 'Kokand', value: 'kokand' },
  { label: 'Margilan', value: 'margilan' },
  { label: 'Termez', value: 'termez' },
  { label: 'Jizzakh', value: 'jizzakh' },
  { label: 'Gulistan', value: 'gulistan' },
  { label: 'Navoi', value: 'navoi' },
];

type CreateCampaignModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreateCampaignModal({ open, onClose }: CreateCampaignModalProps) {
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState('');
  const [selectedCity, setSelectedCity] = useState<typeof UZBEKISTAN_CITIES[0] | null>(null);

  const handleCreate = () => {
    if (campaignName.trim() && selectedCity) {
      // Pass data through state on navigation
      navigate('/dashboard/campaigns/create', {
        state: {
          campaignName: campaignName.trim(),
          city: selectedCity,
        },
      });
      onClose();
    }
  };

  const isFormValid = campaignName.trim().length > 0 && selectedCity !== null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:rocket-2-bold-duotone" width={24} />
          <Typography variant="h6">Create New Campaign</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Campaign Name"
            placeholder="Enter campaign name"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            helperText="This name will be displayed in the campaigns list"
          />

          <Autocomplete
            fullWidth
            options={UZBEKISTAN_CITIES}
            value={selectedCity}
            onChange={(_, newValue) => setSelectedCity(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="City"
                placeholder="Select city"
                helperText="Select main city for the campaign"
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:map-point-bold-duotone" width={16} />
                  <Typography>{option.label}</Typography>
                </Stack>
              </Box>
            )}
          />

          <Box
            sx={{
              p: 2,
              bgcolor: 'background.neutral',
              borderRadius: 1,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:info-circle-bold-duotone" width={16} />
              <Typography variant="body2" color="text.secondary">
                After creation, you will be able to configure budget, targeting and other campaign parameters
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={!isFormValid}
          startIcon={<Iconify icon="solar:arrow-right-bold" />}
        >
          Create Campaign
        </Button>
      </DialogActions>
    </Dialog>
  );
}
