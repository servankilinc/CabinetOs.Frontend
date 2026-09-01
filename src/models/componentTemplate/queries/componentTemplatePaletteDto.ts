/** Ayna: CabinetOs.Model/Dtos/ComponentTemplate/Queries/ComponentTemplatePaletteDto.cs — sözleşme: docs/api-contract/10-component-template.md */
import type { DeviceType } from '@/models/enums';

/**
 * Paletteki (stencil kütüphanesi) tek bir şablon kartı.
 * `GET /api/ComponentTemplate/palette` bunların listesini döner; yalnızca aktif şablonlar.
 */
export interface ComponentTemplatePaletteDto {
  id: string;
  name: string;
  deviceTypeId: DeviceType;
  isSystemTemplate: boolean;
  width: number;
  height: number;
  /** `#RRGGBB` renk dizesi. */
  backgroundColor: string;
  backgroundImageUrl: string | null;
  /** Kartta "10 pin" rozeti için; pinlerin kendisi gönderilmez. */
  pinCount: number;
}
