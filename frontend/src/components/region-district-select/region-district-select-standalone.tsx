import { useState, useCallback } from 'react';
import { TextField, MenuItem, Grid, FormHelperText, Box } from '@mui/material';

import { useRegionDistrictOptions } from 'src/hooks/use-regions';

import { IRegionOption, IDistrictOption } from 'src/types/region';

interface RegionDistrictSelectStandaloneProps {
  
  regionValue?: number | null;
  
  districtValue?: number | null;
  
  onRegionChange: (regionId: number | null) => void;
  
  onDistrictChange: (districtId: number | null) => void;
  
  regionLabel?: string;
  
  districtLabel?: string;
  
  regionPlaceholder?: string;
  
  districtPlaceholder?: string;
  
  size?: 'small' | 'medium';
  
  disabled?: boolean;
  
  fullWidth?: boolean;
  
  regionError?: string;
  
  districtError?: string;
}

export default function RegionDistrictSelectStandalone({
  regionValue,
  districtValue,
  onRegionChange,
  onDistrictChange,
  regionLabel = 'Region',
  districtLabel = 'District / City',
  regionPlaceholder = 'Select region',
  districtPlaceholder = 'Select district',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  regionError,
  districtError,
}: RegionDistrictSelectStandaloneProps) {

  
  const { regions, districts, loading } = useRegionDistrictOptions(regionValue);

  const handleRegionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    const regionId = value === '' ? null : Number(value);
    onRegionChange(regionId);
    // Reset district when region changes
    onDistrictChange(null);
  }, [onRegionChange, onDistrictChange]);

  const handleDistrictChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    const districtId = value === '' ? null : Number(value);
    onDistrictChange(districtId);
  }, [onDistrictChange]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={fullWidth ? 12 : 6}>
        <TextField
          select
          fullWidth
          label={regionLabel}
          error={!!regionError}
          disabled={disabled || loading}
          value={regionValue || ''}
          size={size}
          onChange={handleRegionChange}
        >
          <MenuItem value="">
            <em>{regionPlaceholder}</em>
          </MenuItem>
          {regions.map((region) => (
            <MenuItem key={region.value} value={region.value}>
              {region.label}
            </MenuItem>
          ))}
        </TextField>
        {regionError && (
          <FormHelperText error sx={{ mt: 1 }}>
            {regionError}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={fullWidth ? 12 : 6}>
        {regionValue !== null && regionValue !== undefined && (
          <Box>
            <TextField
              select
              fullWidth
              label={districtLabel}
              error={!!districtError}
              disabled={disabled || loading}
              value={districtValue || ''}
              size={size}
              onChange={handleDistrictChange}
            >
              <MenuItem value="">
                <em>{districtPlaceholder}</em>
              </MenuItem>
              {districts.map((district) => (
                <MenuItem key={district.value} value={district.value}>
                  {district.label}
                </MenuItem>
              ))}
            </TextField>
            {districtError && (
              <FormHelperText error sx={{ mt: 1 }}>
                {districtError}
              </FormHelperText>
            )}
          </Box>
        )}
      </Grid>
    </Grid>
  );
}
