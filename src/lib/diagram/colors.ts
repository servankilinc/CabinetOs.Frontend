/**
 * Renk dönüşümleri.
 *
 * İki farklı renk temsili var ve karıştırılmamalı:
 *   - `ComponentTemplate.backgroundColor`  → **int** (0xRRGGBB)
 *   - `Connection.color`, annotation renkleri → **CSS dizesi** ("#EF4444")
 *
 * Şablon rengi int'tir çünkü palet yazarlığı sayısal renk seçicisiyle yapılır ve
 * DB'de kolon `int`'tir; yeni renk eklemek migration gerektirmez.
 */

const MAX_RGB = 0xffffff;

/**
 * 0xRRGGBB tamsayısını CSS hex dizesine çevirir. 15790320 → "#f0f0f0".
 *
 * Aralık dışı ve NaN değerler siyaha kırpılır: bozuk tek bir şablon kaydı
 * yüzünden `undefined` bir CSS değeri üretip node'u görünmez kılmaktansa,
 * yanlış ama görünür bir renk basmak yeğdir.
 */
export function toCssColor(value: number): string {
  if (!Number.isFinite(value)) return '#000000';
  const clamped = Math.min(Math.max(Math.trunc(value), 0), MAX_RGB);
  return `#${clamped.toString(16).padStart(6, '0')}`;
}

/**
 * CSS hex dizesini 0xRRGGBB tamsayısına çevirir — palet yazarlığında (D3) form
 * girdisini sunucunun beklediği int'e çevirmek için.
 * Kısa biçim ("#abc") genişletilir. Geçersiz girdide `null` döner ki çağıran
 * sessizce 0 (siyah) kaydetmesin.
 */
export function fromCssColor(css: string): number | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(css.trim());
  if (!match?.[1]) return null;

  const hex = match[1];
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map(c => c + c)
          .join('')
      : hex;

  return Number.parseInt(full, 16);
}

/**
 * Verilen zemin rengine karşı okunur bir metin rengi seçer.
 * Şablon rengi serbest olduğu için (koyu zeminde koyu yazı okunmaz) node
 * etiketinin rengi sabit değil, hesaplanmış olmalı.
 *
 * W3C'nin göreli parlaklık eşiği yerine basit YIQ kullanılır: renkler zaten
 * kullanıcı seçimi, kontrast denetimi değil okunabilirlik hedefleniyor.
 */
export function readableTextColor(backgroundColor: number): string {
  if (!Number.isFinite(backgroundColor)) return '#0f172a';
  const value = Math.min(Math.max(Math.trunc(backgroundColor), 0), MAX_RGB);
  const r = (value >> 16) & 0xff;
  const g = (value >> 8) & 0xff;
  const b = value & 0xff;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? '#0f172a' : '#f8fafc';
}
