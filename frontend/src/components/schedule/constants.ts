

export const DAYS = [
  { id: 0, label: 'Sunday', fullLabel: 'Sunday', short: 'Sun' },
  { id: 1, label: 'Monday', fullLabel: 'Monday', short: 'Mon' },
  { id: 2, label: 'Tuesday', fullLabel: 'Tuesday', short: 'Tue' },
  { id: 3, label: 'Wednesday', fullLabel: 'Wednesday', short: 'Wed' },
  { id: 4, label: 'Thursday', fullLabel: 'Thursday', short: 'Thu' },
  { id: 5, label: 'Friday', fullLabel: 'Friday', short: 'Fri' },
  { id: 6, label: 'Saturday', fullLabel: 'Saturday', short: 'Sat' },
] as const;

export const HOURS = Array.from({ length: 24 }, (_, i) => {
  let displayHour: number;
  let period: string;
  
  if (i < 12) {
    displayHour = i === 0 ? 12 : i;
    period = 'AM';
  } else {
    displayHour = i === 12 ? 12 : i - 12;
    period = 'PM';
  }
  
  return {
    id: i,
    label: `${i.toString().padStart(2, '0')}:00`,
    display: `${displayHour}:00 ${period}`,
  };
});

