
import { alpha, styled } from '@mui/material/styles';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';

import { NavItemProps, NavConfigProps } from '../types';

type StyledItemProps = Omit<NavItemProps, 'item'> & {
  config: NavConfigProps;
};

export const StyledItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'active',
})<StyledItemProps>(({ active, depth, config, theme }) => {
  const subItem = depth !== 1;

  const deepSubItem = depth > 2;

  const activeStyles = {
    root: {
      color: '#1976d2',
      backgroundColor: alpha('#1976d2', 0.12),
      fontWeight: 600,
      borderRadius: theme.shape.borderRadius * 1.5,
      boxShadow: `0 2px 8px ${alpha('#1976d2', 0.2)}`,
      '&:hover': {
        backgroundColor: alpha('#1976d2', 0.18),
      },
    },
    sub: {
      color: theme.palette.text.primary,
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  };

  return {
    
    padding: config.itemPadding,
    marginBottom: config.itemGap,
    borderRadius: config.itemRadius,
    minHeight: config.itemRootHeight,
    color: theme.palette.text.secondary,

    
    ...(active && {
      ...activeStyles.root,
    }),

    
    ...(subItem && {
      minHeight: config.itemSubHeight,
      
      ...(active && {
        ...activeStyles.sub,
      }),
    }),

    
    ...(deepSubItem && {
      paddingLeft: theme.spacing(depth),
    }),
  };
});

type StyledIconProps = {
  size?: number;
};

export const StyledIcon = styled(ListItemIcon)<StyledIconProps>(({ size, theme }) => ({
  width: size,
  height: size,
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    transition: theme.transitions.create(['color'], {
      duration: theme.transitions.duration.shorter,
    }),
  },
}));

type StyledDotIconProps = {
  active?: boolean;
};

export const StyledDotIcon = styled('span')<StyledDotIconProps>(({ active, theme }) => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  backgroundColor: theme.palette.text.disabled,
  transition: theme.transitions.create(['transform', 'backgroundColor'], {
    duration: theme.transitions.duration.shorter,
  }),
  ...(active && {
    transform: 'scale(1.5)',
    backgroundColor: '#1976d2',
  }),
}));

type StyledSubheaderProps = {
  config: NavConfigProps;
};

export const StyledSubheader = styled(ListSubheader)<StyledSubheaderProps>(({ config, theme }) => ({
  ...theme.typography.overline,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 1.2,
  cursor: 'pointer',
  display: 'inline-flex',
  padding: config.itemPadding,
  paddingTop: theme.spacing(2),
  marginBottom: config.itemGap,
  paddingBottom: theme.spacing(1),
  color: theme.palette.mode === 'light' ? '#424242' : '#b0b0b0',
  transition: theme.transitions.create(['color'], {
    duration: theme.transitions.duration.shortest,
  }),
  '&:hover': {
    color: theme.palette.text.primary,
  },
}));
