/** Ayna: CabinetOs.Model/Dtos/Diagram/Commands/DiagramSaveRequest.cs — sözleşme: docs/api-contract/03-diagram-save.md */
import type { AnnotationShape, EdgeRouting, LineStyle, WireType } from '@/models/enums';
import type { PointDto } from '../queries/pointDto';

/**
 * Bu dosya, `commands/` klasöründeki zod konvansiyonundan BİLEREK ayrılır.
 *
 * Zod şemaları KULLANICI GİRDİSİNİ doğrulamak için var: hata mesajı bir form
 * alanının altına asılır. Bu gövde ise editörün React Flow state'inden makine
 * tarafından üretilir — bağlanacağı bir form yok, dolayısıyla bir zod parse'ı
 * sunucunun validator'ını kopyalamaktan başka bir iş yapmazdı.
 *
 * Kullanıcının elle yazdığı alanlar (cihaz adı gibi) düzenlendikleri formda
 * doğrulanır, gönderim anında değil.
 */

/** Tek bir varlık ailesinin değişiklik kümesi. `deleted` bir Id dizisidir. */
export interface EntityDelta<TCreate, TUpdate> {
  created: TCreate[];
  updated: TUpdate[];
  deleted: string[];
}


/**
 * Geçici kimliklerin zorunlu öneki.
 *
 * Sunucu bunu dayatır ve istemci de aynısına yaslanır: React Flow'da node/edge
 * id'leri tek bir string uzayında yaşar, "bu daha kaydedilmemiş mi" sorusu
 * `id.startsWith(TEMP_ID_PREFIX)` ile cevaplanır.
 */
export const TEMP_ID_PREFIX = 'tmp_';

export function newTempId(): string {
  return `${TEMP_ID_PREFIX}${crypto.randomUUID()}`;
}

export function isTempId(id: string): boolean {
  return id.startsWith(TEMP_ID_PREFIX);
}

export interface DeviceCreateDraft {
  tempId: string;
  componentTemplateId: string;
  name: string;
  coordinateX: number;
  coordinateY: number;
  rotation: number;
  zIndex: number;
  isLocked: boolean;
  isVisible: boolean;
  externalCode: string | null;
}

/**
 * TAM durum, patch değil. Burada OLMAYAN alanlar sunucuda dokunulmadan kalır —
 * `deviceStatusId` / `lastSeen` (telemetri) ve `ipAddress` / `macAddress` (cihaz
 * yönetimi) bilerek dışarıda: kaydetmek SCADA'nın yazdığı değerleri ezmemeli.
 */
export interface DeviceUpdateDraft {
  id: string;
  name: string;
  coordinateX: number;
  coordinateY: number;
  rotation: number;
  zIndex: number;
  isLocked: boolean;
  isVisible: boolean;
  externalCode: string | null;
}

export interface ConnectionCreateDraft {
  tempId: string;
  /**
   * Uçlar her zaman KALICI pin Id'sidir.
   *
   * Pinler yalnızca sunucuda, cihaz oluşturulurken şablondan üretilir; aynı
   * gönderide doğan bir pine kablo çizmek mümkün değil. Cihaz üzerinde elle pin
   * yazarlığı eklenirse burada birer `*TempId` gerekecek.
   */
  sourcePinId: string;
  targetPinId: string;
  label: string | null;
  wireType: WireType;
  color: string;
  lineStyle: LineStyle;
  strokeWidth: number;
  routing: EdgeRouting;
  waypoints: PointDto[];
  zIndex: number;
}

/** Uçlar YOK: bir kablonun ucunu taşımak sil + oluşturdur (bkz. sözleşme). */
export interface ConnectionUpdateDraft {
  id: string;
  label: string | null;
  wireType: WireType;
  color: string;
  lineStyle: LineStyle;
  strokeWidth: number;
  routing: EdgeRouting;
  waypoints: PointDto[];
  zIndex: number;
}

export interface AnnotationCreateDraft {
  tempId: string;
  name: string;
  coordinateX: number;
  coordinateY: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  isLocked: boolean;
  isVisible: boolean;
  text: string;
  shape: AnnotationShape;
  backgroundColor: string;
  fontColor: string;
  fontSize: number;
  isBold: boolean;
  borderColor: string;
}

export interface AnnotationUpdateDraft {
  id: string;
  name: string;
  coordinateX: number;
  coordinateY: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  isLocked: boolean;
  isVisible: boolean;
  text: string;
  shape: AnnotationShape;
  backgroundColor: string;
  fontColor: string;
  fontSize: number;
  isBold: boolean;
  borderColor: string;
}

/** `cabinetId` ROTADAN gider, gövdede YOKTUR. */
export interface DiagramSaveRequest {
  devices: EntityDelta<DeviceCreateDraft, DeviceUpdateDraft>;
  connections: EntityDelta<ConnectionCreateDraft, ConnectionUpdateDraft>;
  annotations: EntityDelta<AnnotationCreateDraft, AnnotationUpdateDraft>;
}

export function emptyDelta<TCreate, TUpdate>(): EntityDelta<TCreate, TUpdate> {
  return { created: [], updated: [], deleted: [] };
}

export function isDeltaEmpty(delta: EntityDelta<unknown, unknown>): boolean {
  return delta.created.length === 0 && delta.updated.length === 0 && delta.deleted.length === 0;
}

export function isSaveRequestEmpty(request: DiagramSaveRequest): boolean {
  return isDeltaEmpty(request.devices) && isDeltaEmpty(request.connections) && isDeltaEmpty(request.annotations);
}
