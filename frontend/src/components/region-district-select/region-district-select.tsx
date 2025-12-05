import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { TextField, MenuItem, Grid, FormHelperText } from '@mui/material';

import { useRegionDistrictOptions } from 'src/hooks/use-regions';

import { IRegionOption, IDistrictOption } from 'src/types/region';

interface RegionDistrictSelectProps {
  
  regionFieldName: string;
  
  districtFieldName: string;
  
  regionLabel?: string;
  
  districtLabel?: string;
  
  regionPlaceholder?: string;
  
  districtPlaceholder?: string;
  
  size?: 'small' | 'medium';
  
  disabled?: boolean;
  
  fullWidth?: boolean;
  
  onRegionChange?: (regionId: number | null, regionOption?: IRegionOption) => void;
  
  onDistrictChange?: (districtId: number | null, districtOption?: IDistrictOption) => void;
}

export default function RegionDistrictSelect({
  regionFieldName = 'region',
  districtFieldName = 'district',
  regionLabel = 'Region',
  districtLabel = 'District / City',
  regionPlaceholder = 'Select region',
  districtPlaceholder = 'Select district',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  onRegionChange,
  onDistrictChange,
}: RegionDistrictSelectProps) {
  const { control, watch, setValue } = useFormContext();

  
  const regionValue = watch(regionFieldName);
  const districtValue = watch(districtFieldName);

  
  const { regions, districts, loading } = useRegionDistrictOptions(regionValue);

  

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={fullWidth ? 12 : 6}>
        <Controller
          name={regionFieldName}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <>
              <TextField
                select
                fullWidth
                label={regionLabel}
                error={!!error}
                disabled={disabled || loading}
                value={field.value || ''}
                size={size}
                onChange={(e) => {
                  const {value} = e.target;
                  const regionId = value === '' ? null : Number(value);
                  field.onChange(regionId);

                  // Reset district when region changes (async to avoid conflicts)
                  setTimeout(() => {
                    setValue(districtFieldName, null);
                  }, 0);

                  // Region change callback
                  if (onRegionChange) {
                    const selectedRegion = regions.find(r => r.value === regionId);
                    onRegionChange(regionId, selectedRegion);
                  }
                }}
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
              {error && (
                <FormHelperText error sx={{ mt: 1 }}>
                  {error.message}
                </FormHelperText>
              )}
            </>
          )}
        />
      </Grid>

      <Grid item xs={12} sm={fullWidth ? 12 : 6}>
        {regionValue != null && (
          <Controller
            name={districtFieldName}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <TextField
                  select
                  fullWidth
                  label={districtLabel}
                  error={!!error}
                  disabled={disabled || loading}
                  value={field.value || ''}
                  size={size}
                  onChange={(e) => {
                    const {value} = e.target;
                    const districtId = value === '' ? null : Number(value);
                    field.onChange(districtId);

                    
                    if (onDistrictChange) {
                      const selectedDistrict = districts.find(d => d.value === districtId);
                      onDistrictChange(districtId, selectedDistrict);
                    }
                  }}
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
                {error && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    {error.message}
                  </FormHelperText>
                )}
              </>
            )}
          />
        )}
      </Grid>
    </Grid>
  );
}
