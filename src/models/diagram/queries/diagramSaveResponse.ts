/** Ayna: CabinetOs.Model/Dtos/Diagram/Queries/DiagramSaveResponse.cs — sözleşme: docs/api-contract/03-diagram-save.md */

/**
 * Kimlik haritası TAŞIMAZ: Guid'leri istemci ürettiği için geri öğreneceği bir şey
 * yok. Aşağıdaki iki sayaç yalnızca bilgilendirmedir.
 */
export interface DiagramSaveResponse {
  /**
   * Şablondan üretilen pin sayısı. Pinleri hâlâ sunucu üretir ve onların Id'si
   * istemcide bilinmez; sıfırdan büyükse graf tazelenir, aksi hâlde yeni bırakılan
   * cihaz canvas'ta pinsiz kalır ve hiçbir kablo bağlanamaz.
   */
  instantiatedPinCount: number;
  /**
   * Karşılığı bulunamadığı için atlanan silme sayısı. Hata DEĞİLDİR: bilinmeyen
   * bir Id tüm gönderiyi 400'e düşürmez.
   */
  skippedDeleteCount: number;
  savedAtUtc: string;
}
