import { useState } from 'react';
import { CopyIcon, PowerIcon, RotateCwIcon, TimerIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from '@/components/ui/context-menu';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSendCommand } from '@/hooks/use-device-commands';
import { useDiagramCanvasContext } from '@/lib/diagram/canvas-context';
import { useIsUnsaved } from '@/lib/diagram/unsaved-store';
import type { DiagramDeviceDto, DiagramIoChannelDto } from '@/models/diagram';
import { PULSE_DURATION_MAX_MS, PULSE_DURATION_MIN_MS, type DeviceCommandSendRequest } from '@/models/deviceCommand';
import { DeviceCommandType, PinDirection } from '@/models/enums';
import { ConfirmDeleteDialog } from './confirm-delete';

/**
 * Cihaza sağ tık menüsü: kumanda + düzenleme.
 *
 * **Menü, sunucunun ön kontrollerini ÖNCEDEN söyler.** Dış kodu olmayan bir
 * cihaza ya da SCADA'sı kapalı bir kabine komut göndermek 400 döner; kullanıcıya
 * bir hata mesajı yerine sebebi menüde göstermek, tıklanabilir görünüp
 * başarısız olan bir menüden iyidir. Bu doğrulamanın YERİNE GEÇMEZ — sunucu
 * kontrolleri yerinde duruyor ve tek gerçek engel onlar.
 *
 * **Düzenleme bölümü kumanda engellense de görünür.** Engellerin en sık görüleni
 * "cihaz henüz kaydedilmedi" ve yanlışlıkla bırakılmış bir cihazı silmek isteme
 * ihtimalinin en yüksek olduğu an tam olarak orası. İki bölümü aynı koşula
 * bağlamak, yeni bırakılan cihazı menüden silinemez yapardı.
 *
 * Sözleşme: `Backend/docs/api-contract/08-scada-command.md`
 */

/** Parametre isteyen komutlar için açılan diyaloğun hedefi. */
type PendingCommand = { type: typeof DeviceCommandType.PulseOutput | typeof DeviceCommandType.SetValue; channel: DiagramIoChannelDto };

export function DeviceNodeMenu({ device, children }: { device: DiagramDeviceDto; children: React.ReactNode }) {
  const context = useDiagramCanvasContext();
  const send = useSendCommand(device.id);
  const [pending, setPending] = useState<PendingCommand | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  // Erken dönüşten ÖNCE: hook sırası koşullu olamaz.
  const isUnsaved = useIsUnsaved(device.id);

  if (!context) return <>{children}</>;

  // Giriş yönlü kanal kumanda hedefi olamaz (sunucu 400 döner). Bidirectional
  // GEÇERLİDİR: adı gereği çıkış da verebilir.
  const targets = device.ioChannels.filter(channel => channel.isEnabled && channel.direction !== PinDirection.Input);

  const blocker = findBlocker(device, context.scadaIsEnabled, isUnsaved);

  const dispatch = (request: DeviceCommandSendRequest) => send.mutate(request);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className='size-full'>{children}</ContextMenuTrigger>

        <ContextMenuContent className='min-w-52'>
          {/* Düz <div>: `ContextMenuLabel` = Base UI `Menu.GroupLabel` ve bir
              GRUBU etiketlemek zorunda (Radix'in serbest Label'i değil) —
              grupsuz kullanım çalışma anında patlar, derleyici uyarmaz. Cihaz
              adı bir grubun başlığı değil, menünün başlığı. Aşağıdaki iki başlık
              ise gerçek grup etiketi, o yüzden `ContextMenuGroup` içindeler. */}
          <div className='text-muted-foreground truncate px-1.5 py-1 text-xs font-medium'>{device.name}</div>
          <ContextMenuSeparator />

          <ContextMenuGroup>
            <ContextMenuLabel>Kumanda</ContextMenuLabel>
            {blocker ? (
              <p className='text-muted-foreground px-1.5 py-1 text-xs'>{blocker}</p>
            ) : targets.length === 0 ? (
              <p className='text-muted-foreground px-1.5 py-1 text-xs'>Bu cihazda çıkış yönlü kanal yok.</p>
            ) : (
              targets.map(channel => (
                <ContextMenuSub key={channel.id}>
                  <ContextMenuSubTrigger>
                    <PowerIcon />
                    <span className='truncate'>
                      CH{channel.channelNumber} · {channel.name}
                    </span>
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem onClick={() => dispatch({ commandType: DeviceCommandType.SetOutput, ioChannelId: channel.id, value: '1' })}>
                      Aç
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => dispatch({ commandType: DeviceCommandType.SetOutput, ioChannelId: channel.id, value: '0' })}>
                      Kapat
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => setPending({ type: DeviceCommandType.PulseOutput, channel })}>
                      <TimerIcon />
                      Darbe ver…
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setPending({ type: DeviceCommandType.SetValue, channel })}>Değer yaz…</ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
              ))
            )}

            {!blocker && (
              <>
                {/* Modül geneli komutlar kanal hedefi ALMAZ; `ioChannelId`
                    gönderilirse sunucu reddeder. */}
                <ContextMenuItem onClick={() => dispatch({ commandType: DeviceCommandType.Sync })}>
                  <RotateCwIcon />
                  Senkronize et
                </ContextMenuItem>
                <ContextMenuItem variant='destructive' onClick={() => dispatch({ commandType: DeviceCommandType.Reset })}>
                  Modülü yeniden başlat
                </ContextMenuItem>
              </>
            )}
          </ContextMenuGroup>

          <ContextMenuSeparator />

          <ContextMenuGroup>
            <ContextMenuLabel>Düzenle</ContextMenuLabel>
            <ContextMenuItem onClick={() => context.onDuplicate(device.id)}>
              <CopyIcon />
              Kopyala
            </ContextMenuItem>
            {/* Silme EN ALTTA ve onaylı: geri alma yok (D3'te iptal edildi), tek
                yanlış tıklama cihazı kablolarıyla birlikte götürür. */}
            <ContextMenuItem variant='destructive' onClick={() => setConfirmingDelete(true)}>
              <Trash2Icon />
              Sil
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>

      {pending && (
        <CommandParameterDialog
          pending={pending}
          isPending={send.isPending}
          onCancel={() => setPending(null)}
          onSubmit={request => {
            setPending(null);
            dispatch(request);
          }}
        />
      )}

      {confirmingDelete && (
        <ConfirmDeleteDialog
          title='Cihazı sil'
          summary={
            <>
              <span className='font-medium'>{device.name}</span> silinecek. Bu cihaza bağlı kablolar da silinir ve geri alınamaz.
            </>
          }
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            setConfirmingDelete(false);
            context.onDelete(device.id);
          }}
        />
      )}
    </>
  );
}

/**
 * Menünün neden kapalı olduğunu tek bir cümleyle söyler.
 *
 * Sıra sunucudaki ön kontrol sırasıyla aynı tutuldu ki kullanıcı önce hangi
 * engelle karşılaşacaksa onu görsün.
 */
function findBlocker(device: DiagramDeviceDto, scadaIsEnabled: boolean, isUnsaved: boolean): string | null {
  // Kaydedilmemişlik Id'den OKUNAMAZ (Guid'i istemci üretiyor); çağıran taraf
  // `useIsUnsaved` ile okuyup buraya geçirir.
  if (isUnsaved) return 'Cihaz henüz kaydedilmedi. Kaydettikten sonra kumanda gönderilebilir.';
  if (!scadaIsEnabled) return 'Bu kabinde SCADA kapalı; kumanda gönderilemez.';
  if (!device.externalCode) return 'Cihazın dış kodu yok — SCADA onu tanımaz. Özellikler panelinden ekleyin.';
  return null;
}

// ─────────────────────────────────────────────────── parametreli komutlar

/**
 * Süre / değer isteyen komutların diyaloğu.
 *
 * Darbe süresi ve değer menü içinde alınamıyor: menü öğesi tek tıkla çalışır ve
 * bir röleyi 3 saniye mi 30 saniye mi süreceğini yanlış tıklamayla belirlemek
 * kabul edilebilir değil. Onay adımı bilinçli bir sürtünmedir.
 */
function CommandParameterDialog({
  pending,
  isPending,
  onCancel,
  onSubmit
}: {
  pending: PendingCommand;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (request: DeviceCommandSendRequest) => void;
}) {
  const isPulse = pending.type === DeviceCommandType.PulseOutput;
  const [value, setValue] = useState(isPulse ? '1' : '');
  const [duration, setDuration] = useState('3000');

  const parsedDuration = Number(duration);
  const durationValid = Number.isFinite(parsedDuration) && parsedDuration >= PULSE_DURATION_MIN_MS && parsedDuration <= PULSE_DURATION_MAX_MS;
  const canSubmit = value.trim().length > 0 && (!isPulse || durationValid);

  const submit = () =>
    onSubmit(
      isPulse
        ? { commandType: DeviceCommandType.PulseOutput, ioChannelId: pending.channel.id, value: value.trim(), durationMs: parsedDuration }
        : { commandType: DeviceCommandType.SetValue, ioChannelId: pending.channel.id, value: value.trim() }
    );

  return (
    <Dialog open onOpenChange={next => !next && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isPulse ? 'Darbe ver' : 'Değer yaz'}</DialogTitle>
          <DialogDescription>
            CH{pending.channel.channelNumber} · {pending.channel.name}
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-3'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='command-value' className='text-xs'>
              Değer
            </Label>
            {/* Değer STRING gider: kanal başına tip yok. Röle için "1", ayar
                noktası için "250" — ikisi de aynı alandan. */}
            <Input id='command-value' className='h-8' value={value} onChange={e => setValue(e.target.value)} autoFocus />
          </div>

          {isPulse && (
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='command-duration' className='text-xs'>
                Süre (ms)
              </Label>
              <Input
                id='command-duration'
                type='number'
                className='h-8'
                min={PULSE_DURATION_MIN_MS}
                max={PULSE_DURATION_MAX_MS}
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
              <p className='text-muted-foreground text-[10px]'>
                {PULSE_DURATION_MIN_MS}–{PULSE_DURATION_MAX_MS} ms. Süreyi SCADA uygular; bizde bekleyen bir iş yoktur.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant='outline' size='sm' />}>Vazgeç</DialogClose>
          <Button size='sm' disabled={!canSubmit || isPending} onClick={submit}>
            Gönder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
