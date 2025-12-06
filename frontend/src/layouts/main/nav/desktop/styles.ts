
import { alpha, styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';

import { paper } from 'src/theme/css';

import { HEADER } from '../../../config-layout';
import { NavItemDesktopProps } from '../types';

type ListItemProps = Omit<NavItemDesktopProps, 'item'>;

export const ListItem = styled(ListItemButton, {
  shouldForwardProp: (prop) =>
    prop !== 'active' && prop !== 'open' && prop !== 'offsetTop' && prop !== 'subItem',
})<ListItemProps>(({ active, open, offsetTop, subItem, theme }) => {
  const dotActive = {
    content: '""',
    borderRadius: '50%',
    position: 'absolute',
    width: 8,
    height: 8,
    left: -16,
    opacity: 1,
    backgroundColor: '#1976d2',
  };

  return {
    ...theme.typography.subtitle2,
    padding: theme.spacing(1, 2),
    height: '100%',
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.secondary,
    transition: theme.transitions.create(['color', 'background-color'], {
      duration: theme.transitions.duration.shorter,
    }),
    position: 'relative',
    '&:hover': {
      color: theme.palette.text.primary,
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
    
    ...(subItem && {
      ...theme.typography.body2,
      color: theme.palette.text.secondary,
    }),
    
    ...(offsetTop && {
      color: theme.palette.text.secondary,
    }),
    
    ...(active && {
      color: '#1976d2',
      fontWeight: 600,
      backgroundColor: alpha('#1976d2', 0.1),
      '&::before': dotActive,
    }),
    
    ...(active &&
      subItem && {
        ...theme.typography.subtitle2,
        color: '#1976d2',
        fontWeight: 600,
        '&::before': {
          ...dotActive,
          backgroundColor: '#1976d2',
        },
      }),
    
    ...(open && {
      color: theme.palette.text.secondary,
    }),
  };
});

export const StyledMenu = styled(Paper)(({ theme }) => ({
  ...paper({ theme }),
  left: 0,
  right: 0,
  margin: 'auto',
  position: 'fixed',
  zIndex: theme.zIndex.modal,
  padding: theme.spacing(5, 1, 1, 3),
  maxWidth: theme.breakpoints.values.lg,
  top: HEADER.H_DESKTOP_OFFSET,
  boxShadow: theme.customShadows.dropdown,
  borderRadius: theme.shape.borderRadius * 2,
}));

export const StyledSubheader = styled(ListSubheader)(({ theme }) => ({
  ...theme.typography.overline,
  padding: 0,
  fontSize: 11,
  color: theme.palette.text.primary,
}));
