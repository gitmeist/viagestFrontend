import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../service/AuthService';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Servicio de autenticación
  const router = inject(Router); // Router para redirigir si no está autenticado

  // Si el usuario está autenticado, permite el acceso
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no está autenticado, redirige al login
  router.navigate(['/login']);
  return false;
};

