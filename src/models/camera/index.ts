// Queries — sunucu çıktısı, saf interface
export type { CameraDto } from './queries/cameraDto';

// Commands — C# DTO aynaları, saf interface
export type { CameraProbeResultRequest } from './commands/cameraProbeResultRequest';

// Form — ekleme ve düzenlemenin ortak şekli + sunucu şekline projeksiyonlar
export {
  cameraFormSchema,
  emptyCameraForm,
  toCameraForm,
  toCreateRequest,
  toUpdateRequest,
  type CameraCreateRequest,
  type CameraFormValues,
  type CameraUpdateRequest
} from './commands/cameraForm';
