
import { paths } from 'src/routes/paths';

import { PATH_AFTER_LOGIN } from 'src/config-global';

import Iconify from 'src/components/iconify';

export const navConfig = [
  {
    title: 'Home',
    icon: <Iconify icon="solar:home-2-bold-duotone" />,
    path: '/',
  },
  {
    title: 'About',
    icon: <Iconify icon="solar:info-circle-bold-duotone" />,
    path: paths.about,
  },
  {
    title: 'Contact',
    icon: <Iconify icon="solar:phone-bold-duotone" />,
    path: paths.contact,
  },
  {
    title: 'Dashboard',
    icon: <Iconify icon="solar:widget-5-bold-duotone" />,
    path: PATH_AFTER_LOGIN,
  },
];
