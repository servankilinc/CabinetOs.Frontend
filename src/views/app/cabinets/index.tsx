import { Link } from 'react-router';
import { CpuIcon, MapPinIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CabinetStatusBadge } from '@/components/diagram/diagram-toolbar';
import type { CabinetDetailDto } from '@/models/cabinet';
import { useCabinets } from '@/hooks/use-cabinets';

/**
 * Kabin kartları — diyagram editörünün giriş noktası.
 *
 * Tablo değil kart: kabin sayısı azdır ve karar verirken bakılan şey durum ve
 * konumdur, sıralanabilir sütunlar değil.
 */
export default function Cabinets() {
  const { data, isPending, isError, error } = useCabinets();

  return (
    <div className='flex flex-col gap-4 p-4'>
      <div>
        <h1 className='text-lg font-semibold'>Kabinler</h1>
        <p className='text-muted-foreground text-sm'>Diyagramını açmak için bir kabin seçin.</p>
      </div>

      {isError && <p className='text-destructive text-sm'>{error.message}</p>}

      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {isPending && Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className='h-36 w-full rounded-xl' />)}
        {data?.map(cabinet => <CabinetCard key={cabinet.id} cabinet={cabinet} />)}
      </div>

      {data?.length === 0 && (
        <Card>
          <CardContent className='text-muted-foreground py-8 text-center text-sm'>Henüz kabin yok.</CardContent>
        </Card>
      )}
    </div>
  );
}

function CabinetCard({ cabinet }: { cabinet: CabinetDetailDto }) {
  return (
    <Card className={cabinet.isActive ? undefined : 'opacity-60'}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <CpuIcon className='size-4 shrink-0' />
          <span className='truncate'>{cabinet.name}</span>
        </CardTitle>
        <CardDescription className='truncate'>{cabinet.companyName}</CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col gap-3'>
        <div className='flex flex-wrap items-center gap-1.5'>
          <CabinetStatusBadge statusId={cabinet.deviceStatusId} />
          {/* Pasif kayitlar listede GORUNUR — IsActive global query filter'i
              bilerek yok, pasife alinan bir kabin geri alinabilsin diye. */}
          {!cabinet.isActive && <Badge variant='secondary'>Pasif</Badge>}
        </div>

        {cabinet.locationDescription && (
          <p className='text-muted-foreground flex items-center gap-1 truncate text-xs'>
            <MapPinIcon className='size-3 shrink-0' />
            {cabinet.locationDescription}
          </p>
        )}

        <Button size='sm' variant='outline' render={<Link to={`/cabinets/${cabinet.id}/diagram`} />}>
          Diyagramı aç
        </Button>
      </CardContent>
    </Card>
  );
}
