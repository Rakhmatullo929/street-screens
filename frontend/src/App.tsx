
import 'src/locales/i18n';

import 'simplebar-react/dist/simplebar.min.css';

import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

import 'src/utils/mapboxgl';
import 'mapbox-gl/dist/mapbox-gl.css';

import 'react-quill/dist/quill.snow.css';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import 'react-lazy-load-image-component/src/effects/blur.css';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import ReduxProvider from 'src/redux/redux-provider';

import Router from 'src/routes/sections';

import ThemeProvider from 'src/theme';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import ProgressBar from 'src/components/progress-bar';
import MotionLazy from 'src/components/animate/motion-lazy';
import SnackbarProvider from 'src/components/snackbar/snackbar-provider';
import { SettingsProvider, SettingsDrawer } from 'src/components/settings';

import { AuthProvider, AuthConsumer } from 'src/auth/context/jwt';

export default function App() {
  console.log(`

░░░    ░░░ 
▒▒▒▒  ▒▒▒▒ 
▒▒ ▒▒▒▒ ▒▒ 
▓▓  ▓▓  ▓▓ 
██      ██ 
  
  `);

  useScrollToTop();

  return (
    <AuthProvider>
      <ReduxProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <SettingsProvider
            defaultSettings={{
              themeMode: 'light', 
              themeDirection: 'ltr', 
              themeContrast: 'default', 
              themeLayout: 'vertical', 
              themeColorPresets: 'default', 
              themeStretch: false,
            }}
          >
            <ThemeProvider>
              <MotionLazy>
                <SnackbarProvider>
                  <SettingsDrawer />
                  <ProgressBar />
                  <AuthConsumer>
                    <Router />
                  </AuthConsumer>
                </SnackbarProvider>
              </MotionLazy>
            </ThemeProvider>
          </SettingsProvider>
        </LocalizationProvider>
      </ReduxProvider>
    </AuthProvider>
  );
}
