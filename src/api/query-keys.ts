/**
 * TanStack Query anahtarları.
 */

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
  detail: (id: string) => [...cabinetKeys.all, 'detail', id] as const
};
