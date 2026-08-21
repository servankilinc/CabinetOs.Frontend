/**
 * Oturumun localStorage'da tutulan tum parcalari TEK yerde ve TEK anahtarda.
 *
 * Icerik:
 *  - accessToken : her istege Bearer olarak eklenir
 *  - deviceId    : Login/Logout govdesinde gonderilir; backend her cihaz icin
 *                  ayri bir oturum zinciri tutar
 *  - userId      : Logout govdesinde gonderilir ve ileride eklenecek
 *                  RefreshAuth cagrisi icin gerekli olacak
 *
 * userId/deviceId SIR DEGILDIR - gercek sir olan refresh token HttpOnly
 * cookie'de durur ve JS'ten okunamaz.
 */
const STORAGE_KEY = 'cabinetos_auth_session';

/** Oturum kimligi. Ancak ikisi de varsa anlamlidir. */
export interface AuthSession {
  userId: string;
  deviceId: string;
}

interface StoredSession {
  accessToken?: string;
  userId?: string;
  deviceId?: string;
}

function read(): StoredSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : {};
  } catch {
    // Private mode / bozuk JSON: oturum yok kabul edilir.
    return {};
  }
}

/** Var olan kaydin uzerine YAZMAZ, birlestirir - parcalar farkli anlarda gelir. */
function merge(patch: StoredSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...read(), ...patch }));
  } catch {
    /* storage yoksa sessizce gec; oturum yalnizca bu sekme icin calisir */
  }
}

// --- Access token ---

export function getAccessToken(): string | null {
  return read().accessToken ?? null;
}

export function setAccessToken(token: string | null): void {
  merge({ accessToken: token ?? undefined });
}

export function clearAccessToken(): void {
  setAccessToken(null);
}

// --- Oturum kimligi ---

export function getSession(): AuthSession | null {
  const { userId, deviceId } = read();
  if (!userId || !deviceId) return null;
  return { userId, deviceId };
}

export function setSession(session: AuthSession): void {
  merge(session);
}

/** Token dahil her seyi siler. */
export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* yoksay */
  }
}

/**
 * Cihaz kimligi. Girise deviceId gonderilmezse backend her seferinde yeni bir
 * refresh zinciri acar; sabit tutuldugunda "bu cihazdan cikis yap" anlamli olur.
 * Uretildigi anda kaydedilir ki basarisiz bir giris denemesinden sonra bile
 * ayni cihaz kimligiyle devam edilsin.
 */
export function getOrCreateDeviceId(): string {
  const existing = read().deviceId;
  if (existing) return existing;

  const deviceId = crypto.randomUUID();
  merge({ deviceId });
  return deviceId;
}
