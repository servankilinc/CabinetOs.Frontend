import http from '@/lib/axios-helper';
import type { CabinetDetailDto } from '@/models/cabinet';

const CABINET_ROUTE = '/api/Cabinet';

/**
 * Liste PASİF kabinleri de döndürür — `IsActive` global query filter'ı bilerek
 * yok, pasif kaydı görüp geri alabilmek için. Ekran gerekiyorsa kendisi filtreler.
 */
export async function getCabinetList(): Promise<CabinetDetailDto[]> {
  return http.post<CabinetDetailDto[]>(`${CABINET_ROUTE}/list`, {});
}
