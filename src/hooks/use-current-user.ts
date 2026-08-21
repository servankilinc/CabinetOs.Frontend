import { useQuery } from '@tanstack/react-query';
import { me } from '@/api/auth';
import { getAccessToken } from '@/lib/auth-session';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: me,
    // Token yoksa istek hic atilmaz; bu durumda query 'pending' kalir, bu yuzden
    // cagiran taraf once getAccessToken() kontrolu yapmalidir.
    enabled: !!getAccessToken(),
    // 401 tekrar denemekle duzelmez.
    retry: false,
    staleTime: Infinity
  });
}
