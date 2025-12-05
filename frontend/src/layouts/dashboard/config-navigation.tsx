import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { useLocales } from 'src/locales';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  
  
  
  
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
};

const iconify = (name: string) => <Iconify icon={name} />;

const DOOH_ICONS = {
  dashboard: ICONS.dashboard,
  analytics: ICONS.analytics,
  
  
  adsManager: iconify('solar:rocket-2-bold-duotone'),
  screenManager: iconify('solar:monitor-bold-duotone'),
  venues: iconify('solar:buildings-2-bold-duotone'),
  content: iconify('solar:video-library-bold-duotone'),
  
  
  map: iconify('solar:map-point-bold-duotone'),
  
  
  clients: ICONS.user,
  invoices: ICONS.invoice,
  
  
  settings: iconify('solar:settings-bold-duotone'),
} as const;

export function useNavData() {
  const { t } = useLocales();

  const data = useMemo(
    (): Array<{
      subheader: string;
      items: Array<{
        title: string;
        path: string;
        icon: React.ReactElement;
        info?: React.ReactElement;
        disabled?: boolean;
      }>;
    }> => [
      
      
      {
        subheader: t('overview'),
        items: [
          { 
            title: 'Dashboard', 
            path: paths.dashboard.root, 
            icon: DOOH_ICONS.dashboard,
            disabled: true,
            info: <Iconify icon="solar:clock-circle-bold" width={16} sx={{ color: 'warning.main' }} />
          },
          
          
          
          
          
          
          
        ],
      },

      
      
      {
        subheader: 'DOOH Advertising',
        items: [
          {
            title: 'Ads Manager',
            path: paths.dashboard.adsManager,
            icon: DOOH_ICONS.adsManager,
          },
          
          
          
          
          
          
          
        ],
      },

      
      
      {
        subheader: 'Screen Network',
        items: [
          {
            title: 'Screen Manager',
            path: paths.dashboard.screenManager,
            icon: DOOH_ICONS.screenManager,
          },
          {
            title: 'Map View',
            path: paths.dashboard.map,
            icon: DOOH_ICONS.map,
          },
        ],
      },

      
      
      {
        subheader: 'Business',
        items: [
          
          
          
          
          
          
          
          {
            title: 'Invoices',
            path: paths.dashboard.invoice.root,
            icon: DOOH_ICONS.invoices,
            disabled: true,
            info: <Iconify icon="solar:clock-circle-bold" width={16} sx={{ color: 'warning.main' }} />
          },
        ],
      },

      
      
      {
        subheader: 'Settings',
        items: [
          {
            title: 'Account',
            path: paths.dashboard.user.account,
            icon: DOOH_ICONS.settings,
          },
        ],
      },
    ],
    [t]
  );

  return data;
}
