import http from '@/lib/axios-helper';
import type { DiagramDto, DiagramSaveRequest, DiagramSaveResponse } from '@/models/diagram';

const DIAGRAM_ROUTE = '/api/Diagram';

/** Editörün açılışı için gereken her şey tek istekte — canvas ayarları dahil, palet HARİÇ. */
export async function getCabinetDiagram(cabinetId: string): Promise<DiagramDto> {
  return http.get<DiagramDto>(`${DIAGRAM_ROUTE}/cabinet/${cabinetId}`);
}

/**
 * Editörün biriktirdiği tüm değişiklikleri TEK transaction'da uygular.
 */
export async function saveDiagram(cabinetId: string, request: DiagramSaveRequest): Promise<DiagramSaveResponse> {
  return http.post<DiagramSaveResponse>(`${DIAGRAM_ROUTE}/cabinet/${cabinetId}/save`, request);
}
