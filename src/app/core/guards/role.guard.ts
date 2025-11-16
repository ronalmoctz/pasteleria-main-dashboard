import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

type UserRole = 'admin' | 'customer';

/**
 * Role Guard - Protección de rutas basada en roles
 * 
 * Valida que el usuario tenga el rol correcto para acceder a una ruta.
 * Si el usuario no tiene el rol permitido, lo redirige a su dashboard correspondiente.
 * 
 * @param allowedRoles - Array de roles permitidos para la ruta
 * @returns CanActivateFn - Función que valida el acceso
 * 
 * @example
 * // Solo administradores
 * canActivate: [authGuard, roleGuard(['admin'])]
 * 
 * // Solo clientes
 * canActivate: [authGuard, roleGuard(['customer'])]
 * 
 * // Ambos roles
 * canActivate: [authGuard, roleGuard(['admin', 'customer'])]
 */
export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Verificar autenticación
    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    const userRole = authService.user()?.role;
    
    // Validar si el usuario tiene un rol permitido
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    // Redirigir al dashboard correspondiente según el rol del usuario
    if (userRole === 'admin') {
      router.navigate(['/admin/dashboard']);
    } else if (userRole === 'customer') {
      router.navigate(['/customer/dashboard']);
    } else {
      // Rol desconocido - cerrar sesión
      authService.logout();
    }

    return false;
  };
};
