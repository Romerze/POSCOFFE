import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';

/** Local efectivo: el del usuario, o el primero disponible (dueño multi-local). */
export function useLocalId(): string {
  const user = useAuth((s) => s.user);
  const { data: locals } = useQuery({
    queryKey: ['locals'],
    queryFn: api.listLocals,
    enabled: !user?.localId,
  });
  return user?.localId ?? locals?.[0]?.id ?? '';
}
