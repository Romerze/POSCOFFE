import { useAuth } from './store/auth';
import { LoginScreen } from './screens/LoginScreen';
import { CashierScreen } from './screens/CashierScreen';

export default function App() {
  const user = useAuth((s) => s.user);
  return user ? <CashierScreen /> : <LoginScreen />;
}
