import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const RoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // roles permitidos definidos en la ruta
  const allowedRoles = route.data['roles'] as string[];
  const userRole = authService.getRole();

  if (userRole && allowedRoles.includes(userRole)) {
    return true; // ✅ acceso permitido
  }

  // ❌ acceso denegado → redirige al dashboard
  return router.parseUrl('/dashboard');
};
