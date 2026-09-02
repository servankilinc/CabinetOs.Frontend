import { newId } from '@/lib/sequential-id';
import type { ComponentTemplatePaletteDto } from '@/models/componentTemplate';
import type { DiagramIoChannelDto, DiagramPinDto } from '@/models/diagram';

/**
 * Cihaz pinlerinin ve telemetri kanallarının İSTEMCİ TARAFINDAKİ üretimi.
 *
 * **Neden istemcide.** Diyagramdaki diğer bütün Guid'leri istemci üretiyor
 * (`lib/sequential-id.ts`); pin ve kanal bir zamanlar istisnaydı ve bedeli şuydu:
 * paletten bırakılan cihaz Kaydet'e basılana kadar pinsiz duruyor, dolayısıyla
 * kablolanamıyordu. Kimlik burada doğduğunda cihaz anında kablolanabilir hâle
 * gelir ve kaydetme sonrası graf tazelemeye gerek kalmaz.
 *
 * **Taşınan yalnızca kimlik.** Pinin adı, konumu, fonksiyonu, yönü ve gerilimi
 * gönderide GİTMEZ; sunucu her alanı `ComponentTemplatePin`'den kopyalar. Burada
 * üretilenler yalnızca canvas'ın o ana kadarki görüntüsüdür ve sunucunun
 * yazacağıyla birebir aynı olmalıdır — bu yüzden kopyalama tek bir yerde, bu
 * dosyada durur.
 */

export interface InstantiatedPins {
  pins: DiagramPinDto[];
  ioChannels: DiagramIoChannelDto[];
}

/** Paletten bırakma: şablonun pin şemasından yeni bir cihazın pinleri. */
export function instantiateFromTemplate(template: ComponentTemplatePaletteDto): InstantiatedPins {
  return instantiate(
    template.pins.map(pin => ({
      componentTemplatePinId: pin.id,
      name: pin.name,
      relativeX: pin.relativeX,
      relativeY: pin.relativeY,
      side: pin.side,
      function: pin.function,
      direction: pin.direction,
      voltageLevel: pin.voltageLevel,
      channelNumber: pin.channelNumber
    }))
  );
}

/**
 * Cihaz kopyalama: kaynağın pinlerinden kopyanın pinleri.
 *
 * Kaynak pinlerden türetiliyor, paletten değil — `duplicateDevice` böylece palet
 * cache'ine bağımlı olmuyor. Kaynağın pinleri şablonuyla her zaman uyumludur:
 * şablonun yalnızca oluşturma yolu var, pin şeması sonradan değiştirilemiyor.
 *
 * `componentTemplatePinId` KORUNUR (sunucu şemayla eşleşmeyi bununla doğrular),
 * Id'ler ise tazelenir — taşınsalardı kopyaya çizilen kablo kaynağa bağlanırdı.
 */
export function instantiateFromDevicePins(source: DiagramPinDto[]): InstantiatedPins {
  return instantiate(
    source.map(pin => ({
      componentTemplatePinId: pin.componentTemplatePinId,
      name: pin.name,
      relativeX: pin.relativeX,
      relativeY: pin.relativeY,
      side: pin.side,
      function: pin.function,
      direction: pin.direction,
      voltageLevel: pin.voltageLevel,
      channelNumber: pin.channelNumber
    }))
  );
}

type PinShape = Omit<DiagramPinDto, 'id' | 'ioChannelId'>;

function instantiate(shapes: PinShape[]): InstantiatedPins {
  // Aynı cihazda aynı kanal numarası TEK bir IoChannel'dır — sunucudaki
  // `IX_IoChannel_DeviceId_ChannelNumber` bunu zorluyor. Şablonda iki pin aynı
  // kanalı gösteriyorsa (ör. bir girişin besleme ve dönüş ucu) ikisi de aynı
  // kanala bağlanır. Kural sunucuda da var; buradaki kopyası ondan sapmamalı,
  // çünkü sapma bir UX pürüzü değil doğrudan 400 demek.
  const channelsByNumber = new Map<number, DiagramIoChannelDto>();
  const pins: DiagramPinDto[] = [];

  for (const shape of shapes) {
    let ioChannelId: string | null = null;

    if (shape.channelNumber != null) {
      let channel = channelsByNumber.get(shape.channelNumber);
      if (!channel) {
        channel = {
          id: newId(),
          channelNumber: shape.channelNumber,
          direction: shape.direction,
          isEnabled: true,
          name: shape.name
        };
        channelsByNumber.set(shape.channelNumber, channel);
      }
      ioChannelId = channel.id;
    }

    pins.push({ ...shape, id: newId(), ioChannelId });
  }

  return { pins, ioChannels: [...channelsByNumber.values()] };
}
