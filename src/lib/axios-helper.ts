import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { clearSession, getAccessToken } from './auth-session';
import { toApiError } from './api-error';

export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? 'https://localhost:7042';

/**
 * Account uclarinin yolu SABIT ve BUYUK/KUCUK HARFE DUYARLIDIR.
 * Backend rotasi "api/[controller]" oldugu icin dogru yazim "/api/Account"tir;
 * "/api/account/..." yazilirsa cookie tabanli uclar calismaz.
 */
export const ACCOUNT_ROUTE = '/api/Account';

class AxiosService {
  private _axios: AxiosInstance;

  constructor() {
    this._axios = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      // Backend refresh token'i HttpOnly cookie ile yaziyor. Refresh su an
      // kullanilmasa da cookie'nin tasinmasi icin acik birakilir; kapatilirsa
      // refresh eklendiginde sessizce calismaz.
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this._axios.interceptors.request.use(
      config => {
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    this._axios.interceptors.response.use(
      response => response,
      error => {
        // Otomatik token yenileme HENUZ YOK - suresi dolan token'da kullanici
        // login'e dusuruluyor. Backend tarafi hazir (POST /api/Account/RefreshAuth
        // + HttpOnly cookie); eklenirken tek ucuslu (single-flight) bir kuyruk
        // sart, cunku backend refresh token'i her kullanimda donduruyor ve
        // es zamanli iki refresh oturumu tumden dusuruyor.
        if (error.response?.status === 401) {
          console.warn('[auth] 401 alindi, oturum sonlandiriliyor. Otomatik refresh henuz eklenmedi.', {
            url: error.config?.url,
            method: error.config?.method
          });
          // Token temizlenince RequireAuth kendiliginden /login'e yonlendirir.
          clearSession();
        }

        // TUM reject yollari ApiError uzerinden gecer; cagiran taraflarin
        // AxiosError tanimasina veya normalize etmesine gerek kalmaz.
        return Promise.reject(toApiError(error));
      }
    );
  }

  async get<TResponse = undefined>(url: string, config?: AxiosRequestConfig | undefined): Promise<TResponse> {
    const response = await this._axios.get<TResponse>(url, config);
    return response.data;
  }

  async post<TResponse = undefined>(url: string, data?: unknown, config?: AxiosRequestConfig | undefined): Promise<TResponse> {
    const response = await this._axios.post<TResponse>(url, data, config);
    return response.data;
  }

  async put<TResponse = undefined>(url: string, data?: unknown, config?: AxiosRequestConfig | undefined): Promise<TResponse> {
    const response = await this._axios.put<TResponse>(url, data, config);
    return response.data;
  }

  async delete<TResponse = undefined>(url: string, data?: unknown, config?: AxiosRequestConfig | undefined): Promise<TResponse> {
    const response = await this._axios.delete<TResponse>(url, { data, ...config });
    return response.data;
  }
}

export default new AxiosService();
