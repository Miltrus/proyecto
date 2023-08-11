import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { TokenService } from 'src/app/auth/token/token.service';
import Swal from 'sweetalert2';

export const isLoggedInGuard: CanMatchFn = () => {

  const tokenService = inject(TokenService);
  const router = inject(Router);

  let token = localStorage.getItem('token');

  if (token) {
    return tokenService.verifyToken(token).pipe(
      map(response => {
        if (response.status == 'ok') {
          return true;
        } else {
          router.navigate(['auth/login']);
          localStorage.removeItem('token');
          Swal.fire({
            icon: 'warning',
            title: 'Su sesión ha expirado',
            text: 'Por favor inicie sesión nuevamente.',
          })
          return false;
        }
      }),
      catchError(error => {
        return of(false);
      })
    );
  } else {
    router.navigate(['auth/login']);
    Swal.fire({
      icon: 'warning',
      title: 'Su sesión ha expirado',
      text: 'Por favor inicie sesión nuevamente.',
    });
    return of(false); // Retorna un Observable<boolean> usando el operador of
  }
};
