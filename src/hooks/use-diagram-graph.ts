import { useQuery } from '@tanstack/react-query';
import { getCabinetDiagram, getPalette } from '@/api/diagram';
import { diagramKeys } from '@/api/query-keys';

/**
 * Sunucudan gelen DEĞİŞMEZ graf anlık görüntüsü.
 *
 * Bu veri yerelde ASLA mutasyona uğramaz. Düzenleme geldiğinde React Flow state'i ve ayrı bir değişiklik günlüğü tutulur; 
 * buradaki cache yalnızca kaydetme başarılı olduğunda `setQueryData` ile güncellenir.
 */
export function useDiagramGraph(cabinetId: string | undefined) {
  return useQuery({
    queryKey: diagramKeys.cabinet(cabinetId ?? ''),
    queryFn: () => getCabinetDiagram(cabinetId!),
    enabled: !!cabinetId
  });
}

/** Uzun `staleTime`: palet her kabinette aynıdır ve yalnızca şablon yazarlığı */
export function useDiagramPalette() {
  return useQuery({
    queryKey: diagramKeys.palette(),
    queryFn: getPalette,
    staleTime: 30 * 60 * 1000
  });
}
