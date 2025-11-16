import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  // Public routes that don't require authentication
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/recovery-password'
  ];

  // Check if the request is to a public route
  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));

  // Add Bearer token only if:
  // 1. Token exists
  // 2. Not a public route
  // 3. Not a GraphQL endpoint
  if (token && !isPublicRoute && !req.url.includes('api-pasteleria.vercel.app/graphql')) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};
