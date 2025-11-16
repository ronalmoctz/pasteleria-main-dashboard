import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import {
  AuthState,
  LoginRequest,
  LoginResponse,
  RecoveryPasswordRequest,
  RecoveryPasswordResponse,
  User
} from '../../models/auth.model';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  private readonly authState = signal<AuthState>({
    user: this.getUserFromMemory(),
    token: null, // El token se almacena en cookies HttpOnly, no en memoria
    isAuthenticated: false
  });

  readonly user = signal<User | null>(this.authState().user);
  readonly token = signal<string | null>(this.authState().token);
  readonly isAuthenticated = signal<boolean>(this.authState().isAuthenticated);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>(API_CONFIG.endpoints.login, credentials).pipe(
      tap((response) => {
        // Backend puede responder como { token, user } o { success, data: { token, user } }
        const token = (response as any)?.token ?? (response as any)?.data?.token;
        const user = (response as any)?.user ?? (response as any)?.data?.user;
        if (token && user) {
          this.setAuthState(token as string, user as User);
        }
      }),
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  recoveryPassword(request: RecoveryPasswordRequest): Observable<RecoveryPasswordResponse> {
    return this.apiService.post<RecoveryPasswordResponse>(
      API_CONFIG.endpoints.recoveryPassword,
      request
    );
  }

  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.user()?.role === 'admin';
  }

  hasRole(role: 'admin' | 'customer'): boolean {
    return this.user()?.role === role;
  }

  private setAuthState(token: string, user: User): void {
    // ⚠️ IMPORTANTE: El token NO se almacena en localStorage por seguridad
    // El backend DEBE enviar el token en una cookie HttpOnly, Secure, SameSite=Strict
    // Las cookies se envían automáticamente en cada request si withCredentials está habilitado

    // Solo almacenamos el usuario en memoria (en signals)
    this.token.set(token); // Solo en memoria - para uso interno durante la sesión
    this.user.set(user);
    this.isAuthenticated.set(true);
    this.authState.set({ user, token, isAuthenticated: true });
  }

  private clearAuthState(): void {
    // No necesitamos limpiar localStorage ni cookies (las cookies las limpia el backend)
    this.token.set(null);
    this.user.set(null);
    this.isAuthenticated.set(false);
    this.authState.set({ user: null, token: null, isAuthenticated: false });
  }

  private getUserFromMemory(): User | null {
    // El usuario se carga desde sessionStorage como fallback en caso de recarga
    // pero idealmente debería venir de un endpoint de verificación del token
    if (typeof window === 'undefined') return null;
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  /**
   * Verifica si el usuario todavía está autenticado
   * En SSR y en recargas de página, se debe llamar a este método para restaurar el estado
   */
  checkAuthentication(): Observable<boolean> {
    return this.apiService.get<{ user: User }>('/api/auth/me').pipe(
      tap((response) => {
        if (response.user) {
          this.user.set(response.user);
          this.isAuthenticated.set(true);
          sessionStorage.setItem('user', JSON.stringify(response.user));
        }
      }),
      map(() => true),
      catchError(() => {
        // Si falla la verificación, limpiar el estado
        this.clearAuthState();
        return of(false);
      })
    );
  }
}
