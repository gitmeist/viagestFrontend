import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/AuthService';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as Array<string>;
  const userRole = authService.getRole();

  if (!authService.isAuthenticated() || !userRole || !expectedRoles.some(role => userRole.includes(role))) {
    router.navigate(['/home']);
    return false;
  }

  return true;
};
