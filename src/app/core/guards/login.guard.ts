import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/**
 * Login Guard - Previene acceso al login si ya está autenticado
 * 
 * Este guard protege la ruta de login para evitar que usuarios
 * ya autenticados accedan a ella. Si el usuario ya tiene sesión activa,
 * lo redirige a su dashboard correspondiente según su rol.
 * 
 * @returns true si puede acceder al login, false si ya está autenticado
 */
export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario ya está autenticado, redirigir a su dashboard
  if (authService.isAuthenticated()) {
    const userRole = authService.user()?.role;
    
    // Redirigir según el rol del usuario
    if (userRole === 'admin') {
      router.navigate(['/admin/dashboard']);
    } else if (userRole === 'customer') {
      router.navigate(['/customer/dashboard']);
    } else {
      // Rol desconocido - cerrar sesión y permitir acceso al login
      authService.logout();
      return true;
    }
    
    return false;
  }

  // Usuario no autenticado - permitir acceso al login
  return true;
};
