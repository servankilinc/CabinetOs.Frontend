// Commands — kullanici girdisi, zod ile dogrulanir
export { canvasSettingsUpsertSchema, type CanvasSettingsUpsertRequest } from './commands/canvasSettingsUpsertRequest';
export {
  TEMPLATE_MAX_PINS,
  diagramTemplateCreateSchema,
  templatePinDraftSchema,
  type DiagramTemplateCreateRequest,
  type TemplatePinDraft
} from './commands/diagramTemplateCreateRequest';

// Bulk save gövdesi: zod YOK — makine tarafından üretilir, bkz. dosyanın başlığı.
export {
  TEMP_ID_PREFIX,
  newTempId,
  isTempId,
  emptyDelta,
  isDeltaEmpty,
  isSaveRequestEmpty,
  type EntityDelta,
  type DiagramSaveRequest,
  type DeviceCreateDraft,
  type DeviceUpdateDraft,
  type ConnectionCreateDraft,
  type ConnectionUpdateDraft,
  type AnnotationCreateDraft,
  type AnnotationUpdateDraft
} from './commands/diagramSaveRequest';

// Queries — sunucu ciktisi, saf interface
export type { PointDto } from './queries/pointDto';
export type { DiagramDto } from './queries/diagramDto';
export type { DiagramCabinetDto } from './queries/diagramCabinetDto';
export type { DiagramDeviceDto } from './queries/diagramDeviceDto';
export type { DiagramTemplateDto } from './queries/diagramTemplateDto';
export type { DiagramPinDto } from './queries/diagramPinDto';
export type { DiagramIoChannelDto } from './queries/diagramIoChannelDto';
export type { DiagramConnectionDto } from './queries/diagramConnectionDto';
export type { DiagramAnnotationItemDto } from './queries/diagramAnnotationItemDto';
export type { DiagramCanvasSettingsDto } from './queries/diagramCanvasSettingsDto';
export type { ComponentTemplatePaletteDto } from './queries/componentTemplatePaletteDto';
export type { TemplateImageDto } from './queries/templateImageDto';
export type { DiagramSaveResponse, IdMapEntry } from './queries/diagramSaveResponse';
