import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createDiagramTemplate, uploadTemplateImage } from '@/api/diagram';
import { diagramKeys } from '@/api/query-keys';
import { toApiError } from '@/lib/axios-helper';
import type { DiagramTemplateCreateRequest } from '@/models/diagram';

/**
 * Yeni palet şablonu yazar (şablon + pinler tek transaction).
 *
 * Sözleşme: `Backend/docs/api-contract/10-diagram-template.md`
 *
 * Başarıda palet **invalidate** edilir — `setQueryData` DEĞİL. Canvas ayarlarının
 * aksine sunucu burada yalnızca `{ id }` dönüyor; palet kartının ihtiyaç duyduğu
 * `pinCount`, `deviceTypeId` ve renk sunucudan gelmediği için cache'i yerinde
 * güncellemek uydurma veri yazmak olurdu.
 *
 * Bu invalidation güvenli: palet ayrı bir anahtarda duruyor ve diyagram grafına
 * dokunmuyor, yani kaydedilmemiş bir düzenlemeyi ezme riski yok.
 */
/**
 * Şablon arka plan görselini yükler.
 *
 * Cache'e DOKUNMAZ: yükleme henüz hiçbir şablona bağlı değil, yalnızca diske bir
 * dosya koyup URL'sini döndürüyor. Şablon kaydedilmezse dosya öksüz kalır —
 * bunun bedeli birkaç KB, alternatifi ise kullanıcının görseli görmeden pin
 * koyması olurdu.
 */
export function useUploadTemplateImage() {
  return useMutation({
    mutationFn: (file: File) => uploadTemplateImage(file),
    onError: error => {
      toast.error(toApiError(error).message);
    }
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DiagramTemplateCreateRequest) => createDiagramTemplate(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: diagramKeys.palette() });
      toast.success('Şablon oluşturuldu.');
    },
    onError: error => {
      // Alan bazlı hataları form zaten zod ile önden yakalıyor; buraya düşen
      // şey sunucunun söylediği ve istemcinin bilemeyeceği bir sebep.
      toast.error(toApiError(error).message);
    }
  });
}
