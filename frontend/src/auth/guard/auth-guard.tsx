import { useEffect, useCallback, useState } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

import { useAuthContext } from '../hooks';

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();

  const { authenticated, loading } = useAuthContext();

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (!loading) {
      if (!authenticated) {
        const searchParams = new URLSearchParams({ returnTo: window.location.pathname }).toString();

        const href = `${paths.auth.jwt.login}?${searchParams}`;

        router.replace(href);
      } else {
        setChecked(true);
      }
    }
  }, [authenticated, loading, router]);

  useEffect(() => {
    check();
  }, [check]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
