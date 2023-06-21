import { inject, Injectable } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { TokenService } from 'src/app/auth/token/token.service';

export const isLoggedInGuard: CanMatchFn = (route, state) => {

  const tokenService = inject(TokenService);
  const alerts = inject(AlertsService);
  const router = inject(Router);

  let token = localStorage.getItem('token');

  if (token) {
    return tokenService.verifyToken(token).pipe(
      map(response => {
        if (response.status === 'ok') {
          const tokenDate = JSON.parse(atob(token!.split('.')[1]));
          const expirationDate = new Date(tokenDate.exp * 1000);

          if (expirationDate < new Date()) {
            localStorage.removeItem('token');
            router.navigate(['login']);
            alerts.showWarning('Por favor inicie sesión nuevamente', 'Su sesión ha expirado');
            return false;
          }

          return true;

        } else {
          router.navigate(['login']);
          localStorage.removeItem('token');
          alerts.showWarning(response.msj, 'Su sesión ha expirado');
          return false;
        }
      }),
      catchError(error => {
        // Manejar cualquier error que ocurra durante la verificación del token
        return of(false);
      })
    );
  } else {
    router.navigate(['login']);
    alerts.showWarning('Por favor inicie sesión nuevamente', 'Su sesión ha expirado');
    return of(false); // Retorna un Observable<boolean> usando el operador of
  }
};
