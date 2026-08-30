/** Ayna: CabinetOs.Model/Dtos/DeviceCommand/Commands/DeviceCommandSendRequest.cs — sözleşme: docs/api-contract/08-scada-command.md */
import type { DeviceCommandType } from '@/models/enums';

/**
 * `POST /api/Device/{deviceId}/command` gövdesi.
 *
 * **Payload tiplidir, ham JSON string değil.** `DeviceCommand.PayloadJson` bir
 * string kolonu ve onu doğrudan göndermek daha az kod olurdu; o şekilde gövdenin
 * sahaya ne gönderdiği doğrulanamazdı — istemcinin yazdığı metin olduğu gibi röle
 * süren bir sisteme geçerdi. `payloadJson`'ı sunucu bu alanlardan kendisi kurar.
 */
export interface DeviceCommandSendRequest {
  commandType: DeviceCommandType;
  /** Hedef kanal — zorunlu. Kanalsız, modül geneline giden bir kumanda artık yok. */
  ioChannelId: string;
  /** Zorunlu. Telemetriyle aynı şekilde string: röle için `"1"` / `"0"`. */
  value: string;
}
