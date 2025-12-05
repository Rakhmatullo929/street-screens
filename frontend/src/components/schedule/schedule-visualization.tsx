
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import type { WeeklySchedule } from 'src/constants/dooh-data';

import { DAYS, HOURS } from './constants';

interface ScheduleVisualizationProps {
  schedule: WeeklySchedule;
  interactive?: boolean;
  onSlotToggle?: (day: number, hour: number) => void;
  disabled?: boolean;
}

export default function ScheduleVisualization({
  schedule,
  interactive = false,
  onSlotToggle,
  disabled = false,
}: ScheduleVisualizationProps) {
  const handleSlotClick = (day: number, hour: number) => {
    if (interactive && !disabled && onSlotToggle) {
      onSlotToggle(day, hour);
    }
  };

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'auto',
      }}
    >
      {}
      <Grid container sx={{ bgcolor: 'background.neutral' }}>
        <Grid xs={1.5} sx={{ p: 1, borderRight: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" fontWeight="bold">
            Day
          </Typography>
        </Grid>
        {HOURS.map((hour) => (
          <Grid key={hour.id} xs sx={{ p: 1, borderRight: '1px solid', borderColor: 'divider', minWidth: 50 }}>
            <Typography variant="caption" fontWeight="bold" textAlign="center" sx={{ fontSize: '0.7rem' }}>
              {hour.label}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {}
      {DAYS.map((day) => (
        <Grid key={day.id} container>
          <Grid xs={1.5} sx={{ p: 1, borderRight: '1px solid', borderColor: 'divider', borderBottom: '1px solid', borderBottomColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              {day.short}
            </Typography>
          </Grid>
          {HOURS.map((hour) => {
            const isSelected = schedule[`${day.id}-${hour.id}`];
            
            return (
              <Grid key={hour.id} xs sx={{ borderRight: '1px solid', borderColor: 'divider', borderBottom: '1px solid', borderBottomColor: 'divider', minWidth: 50 }}>
                <Box
                  sx={{
                    width: '100%',
                    height: 32,
                    cursor: interactive && !disabled ? 'pointer' : 'default',
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'transparent',
                    bgcolor: isSelected ? 'primary.main' : 'transparent',
                    ...(interactive && !disabled && {
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                      },
                    }),
                    transition: 'all 0.2s',
                  }}
                  onClick={() => handleSlotClick(day.id, hour.id)}
                />
              </Grid>
            );
          })}
        </Grid>
      ))}
    </Box>
  );
}

