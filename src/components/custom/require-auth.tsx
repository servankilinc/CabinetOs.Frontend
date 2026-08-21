import { Navigate, Outlet, useLocation } from 'react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/hooks/use-current-user';
import { clearAccessToken, getAccessToken } from '@/lib/auth-session';

interface RequireAuthProps {
  /** Verilirse kullanicinin bu izne de sahip olmasi gerekir (Faz 2). */
  permission?: string;
}

export default function RequireAuth({ permission }: RequireAuthProps) {
  const location = useLocation();
  const { data: currentUser, isPending, isError } = useCurrentUser();

  // SIRA ONEMLI: token yoksa query `enabled: false` ile pending kalir, bu yuzden
  // token kontrolu her zaman query durumundan once gelmelidir.
  const hasToken = !!getAccessToken();
  if (!hasToken) {
    // from: giristen sonra kullaniciyi geldigi sayfaya geri gonderebilmek icin.
    return <Navigate to='/login' replace state={{ from: location.pathname + location.search }} />;
  }

  if (isPending) {
    return (
      <div className='flex min-h-screen flex-col gap-4 p-8'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-64 w-full' />
      </div>
    );
  }

  // Token var ama sunucu kabul etmedi (suresi dolmus / iptal edilmis).
  // Otomatik yenileme henuz yok; token'i temizleyip kullaniciyi girise gonderiyoruz.
  if (isError || !currentUser) {
    clearAccessToken();
    return <Navigate to='/login' replace state={{ from: location.pathname + location.search }} />;
  }

  if (permission && !currentUser.permissions.includes(permission)) {
    return <Navigate to='/' replace />;
  }

  return <Outlet />;
}
