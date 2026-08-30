/** Ayna: CabinetOs.Model/Dtos/DeviceCommand/Queries/DeviceCommandResultDto.cs — sözleşme: docs/api-contract/08-scada-command.md */
import type { CommandStatus, DeviceCommandType } from '@/models/enums';

/**
 * Bir kumandanın sonucu — hem `POST .../command` yanıtı hem
 * `GET .../commands` satırı.
 *
 * İki ucun aynı şekli döndürmesi bilinçlidir: geçmiş listesi, az önce
 * gönderilen komutu yeniden sorgulamadan başına ekleyebilsin diye.
 *
 * **`status` HTTP durum kodundan bağımsızdır.** İstek 200 dönerken `status`
 * `Failed` ya da `NoResponse` olabilir: 200 "işlem yürütüldü" demektir,
 * "komut başarılı oldu" demek değil.
 */
export interface DeviceCommandResultDto {
  id: string;
  deviceId: string;
  /** `Reset`/`Sync` için null — komut modülün tamamına gider. */
  ioChannelId: string | null;
  channelNumber: number | null;
  commandType: DeviceCommandType;
  /** Gönderilen payload: `{"value":"1"}`. */
  payloadJson: string | null;
  /**
   * `Sent` BU GÖVDEDE GÖRÜLMEZ: satır ancak cevap işlendikten sonra döner.
   * Geçici `Sent` durumu yalnızca veritabanında, istek uçuşta iken vardır.
   */
  status: CommandStatus;
  /** Başarısızlıkta SCADA'nın gövdesi (kırpılmış), zaman aşımında süre bilgisi. */
  resultMessage: string | null;
  sentAt: string | null;
  /** Zaman aşımında da DOLU: cevap gelmedi ama beklemenin bittiği an bilinir. */
  respondedAt: string | null;
  /** SCADA'nın cevap süresi — sunucu hesaplar, istemci tarih aritmetiği yapmaz. */
  elapsedMs: number | null;
  requestedByUserId: string | null;
  requestedByName: string | null;
}
