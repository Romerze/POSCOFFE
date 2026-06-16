import { useAuth } from './store/auth';
import { LoginScreen } from './screens/LoginScreen';
import { AppShell } from './components/AppShell';
import { QrApp } from './screens/QrApp';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const qrLocal = params.get('qr');
  if (qrLocal) return <QrApp localId={qrLocal} mesa={params.get('mesa') ?? undefined} />;

  const user = useAuth((s) => s.user);
  return user ? <AppShell /> : <LoginScreen />;
}
