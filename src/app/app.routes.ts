import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';
import { roleGuard } from './core/guards/role.guard';

/**
 * Configuración de rutas de la aplicación
 * 
 * Estructura de navegación:
 * - /login: Página de inicio de sesión (público)
 * - /admin/dashboard: Dashboard para administradores (protegido, solo admin)
 * - /customer/dashboard: Dashboard para clientes (protegido, solo customer)
 * 
 * Guards utilizados:
 * - loginGuard: Previene acceso al login si ya está autenticado
 * - authGuard: Requiere autenticación para acceder
 * - roleGuard: Valida el rol específico del usuario
 */
export const routes: Routes = [
  // Ruta pública - Login
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
    canActivate: [loginGuard]
  },

  // Rutas de administrador
  {
    path: 'admin',
    children: [
      {
        path: 'dashboard',
        loadComponent: () => 
          import('./pages/admin/dashboard/admin-dashboard').then((m) => m.AdminDashboardComponent),
        canActivate: [authGuard, roleGuard(['admin'])]
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Rutas de cliente
  {
    path: 'customer',
    children: [
      {
        path: 'dashboard',
        loadComponent: () => 
          import('./pages/customer/dashboard/customer-dashboard').then((m) => m.CustomerDashboardComponent),
        canActivate: [authGuard, roleGuard(['customer'])]
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Ruta raíz - Redirige al login
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // Wildcard - Redirige al login para rutas no encontradas
  {
    path: '**',
    redirectTo: '/login'
  }
];
