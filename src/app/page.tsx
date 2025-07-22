'use client';

import LandingPage from './landing-page';
import { useAuth } from './components/AuthProvider/AuthProvider';

export default function Home() {
  const { logout } = useAuth();

  return <LandingPage onLogout={logout} />;
}
