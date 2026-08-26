/** Ayna: CabinetOs.Model/Dtos/DeviceCommand/Commands/DeviceCommandSendRequest.cs — sözleşme: docs/api-contract/08-scada-command.md */
import type { DeviceCommandType } from '@/models/enums';

/**
 * `POST /api/Device/{deviceId}/command` gövdesi.
 *
 * **Payload tiplidir, ham JSON string değil.** `DeviceCommand.PayloadJson` bir
 * string kolonu ve onu doğrudan göndermek daha az kod olurdu; o şekilde
 * `PulseOutput`'un süre taşıdığı sunucuda doğrulanamazdı — süresiz bir darbe
 * röleyi kalıcı olarak çekili bırakabilir. `payloadJson`'ı sunucu bu alanlardan
 * kendisi kurar.
 */
export interface DeviceCommandSendRequest {
  commandType: DeviceCommandType;
  /** `SetOutput`/`PulseOutput`/`SetValue` için zorunlu; `Reset`/`Sync` için NULL OLMALI. */
  ioChannelId?: string | null;
  /** Telemetriyle aynı şekilde string: röle için `"1"`, ayar noktası için `"250"`. */
  value?: string | null;
  /** Yalnızca `PulseOutput`; 50–600.000 ms. Süreyi SCADA uygular. */
  durationMs?: number | null;
}

/** Darbe süresinin sunucudaki sınırları — girdi burada da kırpılsın diye aynalanır. */
export const PULSE_DURATION_MIN_MS = 50;
export const PULSE_DURATION_MAX_MS = 600_000;
