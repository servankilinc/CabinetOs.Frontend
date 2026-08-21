import { useCallback } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';

/**
 * Izin kontrolu. YALNIZCA UX icindir - menuyu/butonu gizler.
 * Gercek yetkilendirme backend'de policy ile yapilir; burasi atlatilabilir.
 */
export function usePermission() {
  const { data: currentUser } = useCurrentUser();
  const permissions = currentUser?.permissions;
  return useCallback((permission: string) => permissions?.includes(permission) ?? false, [permissions]);
}
