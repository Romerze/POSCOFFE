import { useAuth } from './store/auth';
import { LoginScreen } from './screens/LoginScreen';
import { AppShell } from './components/AppShell';

export default function App() {
  const user = useAuth((s) => s.user);
  return user ? <AppShell /> : <LoginScreen />;
}
