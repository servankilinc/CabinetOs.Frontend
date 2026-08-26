import { Navigate } from 'react-router';

/**
 * Uygulamanin giris noktasi kabin listesidir; kok yol oraya yonlendirir.
 * Burasi daha once bos bir sayfaydi ve giris sonrasi kullaniciyi cikmaza
 * dusuruyordu.
 */
export default function Home() {
  return <Navigate to='/cabinets' replace />;
}
