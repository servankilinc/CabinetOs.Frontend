/** Ayna: CabinetOs.Model/Dtos/Diagram/Queries/ComponentTemplatePaletteDto.cs — sözleşme: docs/api-contract/02-diagram-read.md */
import type { DeviceType } from '@/models/enums';

/**
 * Paletteki (stencil kütüphanesi) tek bir şablon kartı.
 * `GET /api/Diagram/palette` bunların listesini döner; yalnızca aktif şablonlar.
 */
export interface ComponentTemplatePaletteDto {
  id: string;
  name: string;
  deviceTypeId: DeviceType;
  isSystemTemplate: boolean;
  width: number;
  height: number;
  /** 0xRRGGBB TAMSAYISI — renk dizesi değil. */
  backgroundColor: number;
  backgroundImageUrl: string | null;
  /** Kartta "10 pin" rozeti için; pinlerin kendisi gönderilmez. */
  pinCount: number;
}
