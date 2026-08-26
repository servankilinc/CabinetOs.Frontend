/** Ayna: CabinetOs.Model/Dtos/Diagram/Queries/DiagramSaveResponse.cs — sözleşme: docs/api-contract/03-diagram-save.md */

/**
 * Bir geçici kimliğin karşılığı olan sunucu Id'si.
 *
 * Sözlük değil DİZİ olmasının sebebi sunucu tarafında: sözlük anahtarları
 * serializer'ın `DictionaryKeyPolicy`'sine tabidir ve bu proje o politikayı
 * `ProblemDetails.errors` anahtarları PascalCase kalsın diye bilerek kapattı.
 * Geçici kimliği bir DEĞER olarak taşımak onu casing kurallarının dışında tutar.
 */
export interface IdMapEntry {
  tempId: string;
  id: string;
}

export interface DiagramSaveResponse {
  devices: IdMapEntry[];
  connections: IdMapEntry[];
  annotations: IdMapEntry[];
  /**
   * Şablondan üretilen pin sayısı.
   *
   * Bu pinlerin geçici kimliği YOKTUR, dolayısıyla `idMap` ile öğrenilemezler.
   * Sıfırdan büyükse istemci grafı yeniden çekmek ZORUNDA: aksi halde yeni
   * bırakılan cihaz canvas'ta pinsiz görünür ve hiçbir kablo bağlanamaz.
   */
  instantiatedPinCount: number;
  savedAtUtc: string;
}
