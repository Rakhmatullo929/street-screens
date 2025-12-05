import { useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

import {
  generateBusinessSchedule,
  generateEveningSchedule,
  generateWeekendSchedule,
  generateAlwaysOnSchedule,
} from 'src/constants/dooh-data';
import { DAYS, HOURS } from './constants';
import ScheduleVisualization from './schedule-visualization';

export interface TimeSlot {
  day: number; 
  hour: number; 
  enabled: boolean;
}

export interface WeeklySchedule {
  [key: string]: boolean; 
}

interface WeeklyScheduleCalendarProps {
  value?: WeeklySchedule;
  onChange?: (schedule: WeeklySchedule) => void;
  startDate?: Date;
  endDate?: Date;
  disabled?: boolean;
}

const PRESET_SCHEDULES = {
  business: {
    label: 'Business Days',
    description: 'Mon-Fri, 9:00-18:00',
    schedule: generateBusinessSchedule(),
  },
  evening: {
    label: 'Evening Time',
    description: 'Daily, 18:00-23:00',
    schedule: generateEveningSchedule(),
  },
  weekend: {
    label: 'Weekends',
    description: 'Sat-Sun, 10:00-22:00',
    schedule: generateWeekendSchedule(),
  },
  always: {
    label: '24/7',
    description: '24/7',
    schedule: generateAlwaysOnSchedule(),
  },
};

export default function WeeklyScheduleCalendar({
  value = {},
  onChange,
  startDate,
  endDate,
  disabled = false,
}: WeeklyScheduleCalendarProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const totalSlots = useMemo(() => Object.values(value).filter(Boolean).length, [value]);

  const selectedPercentage = useMemo(() => ((totalSlots / (7 * 24)) * 100).toFixed(1), [totalSlots]);

  const handleSlotToggle = (day: number, hour: number) => {
    if (disabled) return;

    const key = `${day}-${hour}`;
    const newSchedule = {
      ...value,
      [key]: !value[key],
    };

    onChange?.(newSchedule);
  };

  const handlePresetSelect = (presetKey: string) => {
    if (disabled) return;

    const preset = PRESET_SCHEDULES[presetKey as keyof typeof PRESET_SCHEDULES];
    setSelectedPreset(presetKey);
    onChange?.(preset.schedule);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange?.({});
    setSelectedPreset(null);
  };

  const isSlotSelected = (day: number, hour: number) => !!value[`${day}-${hour}`];

  const getDayStats = (day: number) => {
    const selectedHours = HOURS.filter(hour => isSlotSelected(day, hour.id)).length;
    return { selected: selectedHours, total: 24 };
  };

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        {}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:clock-circle-bold-duotone" width={20} />
          <Typography variant="h6">Display Schedule</Typography>
        </Stack>

        {}
        <Box
          sx={{
            p: 2,
            bgcolor: 'primary.lighter',
            borderRadius: 1,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="subtitle2" color="primary.darker">
                Selected slots: <strong>{totalSlots}</strong> of 168
              </Typography>
              <Typography variant="subtitle2" color="primary.darker">
                Coverage: <strong>{selectedPercentage}%</strong>
              </Typography>
            </Stack>

            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={handleClearAll}
              disabled={disabled}
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
            >
              Clear
            </Button>
          </Stack>
        </Box>

        {}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Quick Settings:
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(PRESET_SCHEDULES).map(([key, preset]) => (
              <Grid key={key}>
                <Chip
                  label={`${preset.label} (${preset.description})`}
                  variant={selectedPreset === key ? 'filled' : 'outlined'}
                  color={selectedPreset === key ? 'primary' : 'default'}
                  onClick={() => handlePresetSelect(key)}
                  disabled={disabled}
                  sx={{ mb: 1 }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Schedule Settings:
          </Typography>

          <ScheduleVisualization
            schedule={value}
            interactive
            onSlotToggle={handleSlotToggle}
            disabled={disabled}
          />
        </Box>

        {}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Daily Statistics:
          </Typography>
          <Grid container spacing={1}>
            {DAYS.map((day) => {
              const stats = getDayStats(day.id);
              const percentage = ((stats.selected / stats.total) * 100).toFixed(0);

              return (
                <Grid key={day.id} xs={12} sm={6} md={1.7}>
                  <Box
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: stats.selected > 0 ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      bgcolor: stats.selected > 0 ? alpha('#1976d2', 0.04) : 'transparent',
                    }}
                  >
                    <Stack alignItems="center" spacing={0.5}>
                      <Typography variant="caption" fontWeight="bold">
                        {day.short}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stats.selected}/24h
                      </Typography>
                      <Typography variant="caption" color="primary.main">
                        {percentage}%
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Stack>
    </Card>
  );
}

