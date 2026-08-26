import { useQuery } from '@tanstack/react-query';
import { getCabinetList } from '@/api/cabinet';
import { cabinetKeys } from '@/api/query-keys';

/** Kabin kartları listesi — diyagram editörünün giriş noktası. */
export function useCabinets() {
  return useQuery({
    queryKey: cabinetKeys.list(),
    queryFn: getCabinetList
  });
}
