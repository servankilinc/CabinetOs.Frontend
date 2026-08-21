import http, { ACCOUNT_ROUTE } from '@/lib/axios-helper';
import { getOrCreateDeviceId, setSession, clearSession, getSession, setAccessToken } from '@/lib/auth-session';
import type { LoginRequest, LoginResponse, SignUpRequest, SignUpResponse } from '@/models/auth';
import type { CurrentUserDto } from '@/models/user';

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const deviceId = getOrCreateDeviceId();
  const response = await http.post<LoginResponse>(`${ACCOUNT_ROUTE}/Login`, {
    userName: request.userName,
    password: request.password,
    deviceId,
    clientType: import.meta.env.VITE_CLIENT_TYPE
  });

  setAccessToken(response.accessToken.token);
  setSession({ userId: response.user.id, deviceId: response.deviceId });
  return response;
}

export async function signUp(request: SignUpRequest): Promise<SignUpResponse> {
  const deviceId = getOrCreateDeviceId();
  const response = await http.post<SignUpResponse>(`${ACCOUNT_ROUTE}/SignUp`, {
    userName: request.userName,
    email: request.email,
    fullName: request.fullName,
    companyId: request.companyId,
    phoneNumber: request.phoneNumber || null,
    password: request.password,
    deviceId,
    clientType: import.meta.env.VITE_CLIENT_TYPE
  });

  // SignUpResponse'ta `user` YOKTUR (LoginResponse'un aksine); oturum kimligini
  // tamamlamak icin kullanici bilgisi Me() ile alinir.
  setAccessToken(response.accessToken.token);
  return response;
}

// NOT: Otomatik token yenileme HENUZ EKLENMEDI. Backend hazir
// (POST /api/Account/RefreshAuth + HttpOnly cookie) ve sozlesme modeli
// models/auth/queries/refreshAuthResponse.ts altinda duruyor. Eklenirken
// tek ucuslu (single-flight) bir kuyruk sart: backend refresh token'i her
// kullanimda donduruyor, es zamanli iki refresh oturumu tumden dusuruyor.

export async function me(): Promise<CurrentUserDto> {
  return http.get<CurrentUserDto>(`${ACCOUNT_ROUTE}/Me`);
}

/** SignUp sonrasi oturum kimligini tamamlar; kayit yanitinda user gelmedigi icin gerekli. */
export function completeSession(userId: string, deviceId: string): void {
  setSession({ userId, deviceId });
}

export async function logout(): Promise<void> {
  const session = getSession();
  try {
    if (session) {
      await http.post(`${ACCOUNT_ROUTE}/Logout`, { userId: session.userId, deviceId: session.deviceId });
    }
  } finally {
    // Sunucu cagrisi basarisiz olsa bile yerel oturum MUTLAKA temizlenir;
    // aksi halde kullanici "cikis yaptim" sanip oturumda kalir.
    // clearSession() token dahil tek anahtarin tamamini siler.
    clearSession();
  }
}

export async function revokeAll(): Promise<void> {
  try {
    await http.post(`${ACCOUNT_ROUTE}/RevokeAll`);
  } finally {
    // clearSession() token dahil tek anahtarin tamamini siler.
    clearSession();
  }
}
