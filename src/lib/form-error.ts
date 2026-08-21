import { toast } from 'sonner';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { toApiError } from '@/lib/api-error';

/**
 * Form mutation'larinin ortak hata politikasi:
 *   - Alan bazli dogrulama hatasi varsa ilgili input'un altinda gosterilir
 *   - Yoksa tek satirlik bir toast basilir
 *
 * Bu POLITIKADIR, transport degil - bu yuzden interceptor'da degil burada durur.
 * Liste sorgulari veya arka plan mutation'lari farkli davranmak isteyebilir
 * (or. sessiz kalmak) ve onlar bu yardimciyi kullanmaz.
 *
 * Kullanim:  onError: error => handleFormApiError(error, form.setError)
 */
export function handleFormApiError<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>
): void {
  const apiError = toApiError(error);

  if (!apiError.hasFieldErrors) {
    toast.error(apiError.message);
    return;
  }

  for (const [field, messages] of Object.entries(apiError.fieldErrors)) {
    setError(field as Path<TFieldValues>, { message: messages[0] });
  }
}
