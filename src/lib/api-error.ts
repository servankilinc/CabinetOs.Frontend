import axios from 'axios';
import type { ProblemDetails } from '@/models/common/problemDetails';

const DEFAULT_MESSAGE = 'Beklenmeyen bir hata olustu. Lutfen tekrar deneyin.';
const NETWORK_MESSAGE = 'Sunucuya ulasilamiyor. Baglantinizi kontrol edin.';


export class ApiError extends Error {
  /** HTTP durum kodu; aga hic cikilamadiysa 0. */
  readonly status: number;
  /** Alan bazli dogrulama hatalari (yalnizca 400'de dolu). Anahtarlar camelCase'e cevrilmistir. */
  readonly fieldErrors: Record<string, string[]>;
  readonly problem?: ProblemDetails;

  constructor(message: string, status: number, fieldErrors: Record<string, string[]>, problem?: ProblemDetails, cause?: unknown) {
    super(message, { cause });
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.problem = problem;
  }

  get hasFieldErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }
}

/**
 * Herhangi bir hatayi ApiError'a cevirir. Zaten ApiError ise oldugu gibi doner,
 * boylece cift normalize etmek zararsizdir.
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    // Sunucuya hic ulasilamadi (ag kopuk, CORS, sertifika).
    if (!error.response) {
      return new ApiError(NETWORK_MESSAGE, 0, {}, undefined, error);
    }

    const problem = error.response.data as ProblemDetails | undefined;
    // Backend PascalCase alan adi dondurur ("UserName"); form alanlari camelCase.
    const fieldErrors = toCamelCaseKeys(problem?.errors);

    // Oncelik sirasi: ilk dogrulama hatasi > detail > title. Boylece kullanici
    // "The operation could not be completed" yerine gercek sebebi gorur.
    const firstFieldError = Object.values(fieldErrors)[0]?.[0];
    const message = firstFieldError || problem?.detail || problem?.title || error.message || DEFAULT_MESSAGE;

    return new ApiError(message, error.response.status, fieldErrors, problem, error);
  }

  return new ApiError(error instanceof Error ? error.message : DEFAULT_MESSAGE, 0, {}, undefined, error);
}

function toCamelCaseKeys(errors: Record<string, string[]> | undefined): Record<string, string[]> {
  if (!errors) return {};
  const result: Record<string, string[]> = {};
  for (const [field, messages] of Object.entries(errors)) {
    if (!messages?.length) continue;
    result[field.charAt(0).toLowerCase() + field.slice(1)] = messages;
  }
  return result;
}
