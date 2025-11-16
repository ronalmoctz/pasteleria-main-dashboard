import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/**
 * Auth Guard - Protección básica de autenticación
 * 
 * Valida que el usuario esté autenticado antes de acceder a una ruta.
 * Si no está autenticado, lo redirige a la página de login.
 * 
 * Este guard no valida roles, solo autenticación. Para validar roles
 * específicos, usar en combinación con roleGuard.
 * 
 * @returns true si está autenticado, false si no lo está
 * 
 * @example
 * // Solo autenticación
 * canActivate: [authGuard]
 * 
 * // Autenticación + rol específico
 * canActivate: [authGuard, roleGuard(['admin'])]
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (authService.isAuthenticated()) {
    return true;
  }

  // Usuario no autenticado - redirigir al login
  router.navigate(['/login']);
  return false;
};
