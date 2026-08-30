/**
 * TanStack Query anahtarları.
 */
import type { ChannelEventQueryRequest } from '@/models/channelEvent';

export const diagramKeys = {
  all: ['diagram'] as const,
  /** Bir kabinin tüm grafı — canvas ayarları DAHİL (aggregate'in içinde gelir). */
  cabinet: (cabinetId: string) => [...diagramKeys.all, 'cabinet', cabinetId] as const,
  /**
   * Palet(complete-template) her kabinet de aynı olduğu için uzun `staleTime` ile cachelenir.
   */
  palette: () => [...diagramKeys.all, 'palette'] as const,
  /** Bir cihazın komut geçmişi. */
  deviceCommands: (deviceId: string) => [...diagramKeys.all, 'device', deviceId, 'commands'] as const
};

export const cabinetKeys = {
  all: ['cabinet'] as const,
  list: () => [...cabinetKeys.all, 'list'] as const,
  detail: (id: string) => [...cabinetKeys.all, 'detail', id] as const,
  /** Düzenleme formunun kaynağı (`GET /{id}/update`) — SCADA alanları yalnızca burada. */
  updateModel: (id: string) => [...cabinetKeys.all, 'update-model', id] as const
};

export const companyKeys = {
  all: ['company'] as const,
  list: () => [...companyKeys.all, 'list'] as const
};

export const cameraKeys = {
  all: ['camera'] as const,
  /** Kabin başına liste; `includePassive` ayrı bir anahtar — iki liste farklı veri. */
  byCabinet: (cabinetId: string, includePassive: boolean) =>
    [...cameraKeys.all, 'cabinet', cabinetId, includePassive] as const,
  detail: (id: string) => [...cameraKeys.all, 'detail', id] as const
};

export const channelEventKeys = {
  all: ['channel-event'] as const,
  /**
   * Filtre nesnesinin TAMAMI anahtara giriyor: tarih aralığı veya kanal
   * değiştiğinde bu başka bir sorgudur. Yalnızca `cabinetId` ile anahtarlamak,
   * filtre değişiminde eski sayfayı göstermeye devam etmek olurdu.
   */
  list: (request: ChannelEventQueryRequest) => [...channelEventKeys.all, 'list', request] as const
};
