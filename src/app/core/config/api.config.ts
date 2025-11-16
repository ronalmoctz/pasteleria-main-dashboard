export const API_CONFIG = {
  baseUrl: 'https://api-pasteleria.vercel.app',
  apiV1: 'https://api-pasteleria.vercel.app/api/v1',
  graphql: 'https://api-pasteleria.vercel.app/graphql',
  endpoints: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    recoveryPassword: '/api/auth/recovery-password',
    getUserByEmail: (email: string) => `/api/users/email/${encodeURIComponent(email)}`
  }
} as const;

// Token de inyección para la URL base de la API
import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

// Proveedor de la URL base de la API para inyección de dependencias
export const apiBaseUrlProvider = {
  provide: API_BASE_URL,
  useValue: API_CONFIG.apiV1
};
