import http from '@/lib/axios-helper';
import type { CreatedDto } from '@/models/common/createdDto';
import type {
  CanvasSettingsUpsertRequest,
  ComponentTemplatePaletteDto,
  DiagramCanvasSettingsDto,
  DiagramDto,
  DiagramSaveRequest,
  DiagramSaveResponse,
  DiagramTemplateCreateRequest,
  TemplateImageDto
} from '@/models/diagram';

const DIAGRAM_ROUTE = '/api/Diagram';

/** Editörün açılışı için gereken her şey tek istekte — canvas ayarları dahil. */
export async function getCabinetDiagram(cabinetId: string): Promise<DiagramDto> {
  return http.get<DiagramDto>(`${DIAGRAM_ROUTE}/cabinet/${cabinetId}`);
}

/** Yalnızca aktif şablonlar döner. */
export async function getPalette(): Promise<ComponentTemplatePaletteDto[]> {
  return http.get<ComponentTemplatePaletteDto[]>(`${DIAGRAM_ROUTE}/palette`);
}

/**
 * Canvas tercihlerini yazar (upsert). `cabinetId` http ile gider
 */
export async function upsertCanvasSettings(cabinetId: string, request: CanvasSettingsUpsertRequest): Promise<DiagramCanvasSettingsDto> {
  return http.put<DiagramCanvasSettingsDto>(`${DIAGRAM_ROUTE}/cabinet/${cabinetId}/canvas-settings`, request);
}

/**
 * Editörün biriktirdiği tüm değişiklikleri TEK transaction'da uygular.
 */
export async function saveDiagram(cabinetId: string, request: DiagramSaveRequest): Promise<DiagramSaveResponse> {
  return http.post<DiagramSaveResponse>(`${DIAGRAM_ROUTE}/cabinet/${cabinetId}/save`, request);
}

/**
 * Palet şablonunu ve pin şemasını TEK transaction'da oluşturur.
 */
export async function createDiagramTemplate(request: DiagramTemplateCreateRequest): Promise<CreatedDto> {
  return http.post<CreatedDto>(`${DIAGRAM_ROUTE}/template`, request);
}

/**
 * Şablon arka plan görselini yükler; URL döner.
 */
export async function uploadTemplateImage(file: File): Promise<TemplateImageDto> {
  const form = new FormData();
  form.append('file', file);
  return http.post<TemplateImageDto>(`${DIAGRAM_ROUTE}/template/image`, form);
}
