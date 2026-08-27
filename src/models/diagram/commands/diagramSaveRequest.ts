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

/**
 * Tek bir varlık ailesinin değişiklik kümesi.
 *
 * **`created`/`updated` ayrımı YOKTUR.** Guid'i istemci ürettiği için bir
 * taslağın yeni mi mevcut mu olduğu sunucuda tek bir yerde — Id veritabanında
 * var mı — cevaplanır. İstemcinin bunu ayrıca takip etmesi gerekmez.
 */
export interface EntityDelta<T> {
  upserted: T[];
  /**
   * Karşılığı bulunamayan Id'ler sunucuda SESSİZCE ATLANIR (`skippedDeleteCount`).
   * Bu yüzden buraya hiç kaydedilmemiş bir kaydın Id'si düşse bile gönderi
   * bozulmaz.
   */
  deleted: string[];
}

export interface DeviceDraft {
  id: string;
  /**
   * Yalnızca OLUŞTURMADA kullanılır. Mevcut bir cihazın şablonu değiştirilemez —
   * farklı gönderilirse sunucu 400 döner.
   */
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

export interface ConnectionDraft {
  id: string;
  /**
   * Uçlar her zaman KALICI pin Id'sidir ve mevcut bir kabloda DEĞİŞTİRİLEMEZ
   * (farklı gönderilirse 400). Bir kablonun ucunu taşımak sil + oluştur'dur.
   *
   * Pinler yalnızca sunucuda, cihaz oluşturulurken şablondan üretilir.
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

export interface AnnotationDraft {
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

/**
 * `cabinetId` ROTADAN gider, gövdede YOKTUR.
 *
 * Taslaklar TAM durumdur, patch değil. Burada OLMAYAN alanlar sunucuda
 * dokunulmadan kalır — `deviceStatusId` / `lastSeen` (telemetri) ve `ipAddress` /
 * `macAddress` (cihaz yönetimi) bilerek dışarıda: kaydetmek SCADA'nın yazdığı
 * değerleri ezmemeli.
 */
export interface DiagramSaveRequest {
  devices: EntityDelta<DeviceDraft>;
  connections: EntityDelta<ConnectionDraft>;
  annotations: EntityDelta<AnnotationDraft>;
}

export function emptyDelta<T>(): EntityDelta<T> {
  return { upserted: [], deleted: [] };
}

export function isDeltaEmpty(delta: EntityDelta<unknown>): boolean {
  return delta.upserted.length === 0 && delta.deleted.length === 0;
}

export function isSaveRequestEmpty(request: DiagramSaveRequest): boolean {
  return isDeltaEmpty(request.devices) && isDeltaEmpty(request.connections) && isDeltaEmpty(request.annotations);
}
