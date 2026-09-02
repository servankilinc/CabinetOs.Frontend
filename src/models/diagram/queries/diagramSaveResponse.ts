/** Ayna: CabinetOs.Model/Dtos/Diagram/Queries/DiagramSaveResponse.cs — sözleşme: docs/api-contract/03-diagram-save.md */

/**
 * İstemcinin geri ÖĞRENECEĞİ hiçbir şey yok.
 *
 * Diyagramdaki her satırın — cihaz, kablo, not, pin ve kanal dahil — Guid'ini
 * istemci üretiyor, dolayısıyla ne kimlik haritası ne de "sunucu şunu da yarattı"
 * bilgisi gerekiyor. Kaydetme atomik olduğu için 200 tek başına "gönderdiğim her
 * şey kalıcı" demektir.
 *
 * Önceki iki sayaç (`instantiatedPinCount`, `skippedDeleteCount`) KALDIRILDI:
 * ilki pinleri sunucu ürettiği dönemde grafı tazelemenin tetikleyicisiydi ve o
 * ihtiyaç ortadan kalktı; ikincisini hiçbir istemci okumuyordu.
 */
export interface DiagramSaveResponse {
  savedAtUtc: string;
}
