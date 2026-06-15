import { useAuth } from './store/auth';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';

export default function App() {
  const user = useAuth((s) => s.user);
  return user ? <HomeScreen /> : <LoginScreen />;
}
