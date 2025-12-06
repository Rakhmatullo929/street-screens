
import { Theme, SxProps } from '@mui/material/styles';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

type Props = {
  sx?: SxProps<Theme>;
};

export default function LoginButton({ sx }: Props) {
  return (
    <Button component={RouterLink} href={paths.auth.jwt.login} variant="outlined" sx={{ mr: 1, ...sx }}>
      Login
    </Button>
  );
}
