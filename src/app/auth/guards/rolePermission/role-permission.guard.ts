import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { RolService } from 'src/app/services/api/rol/rol.service';
import { UsuarioService } from 'src/app/services/api/usuario/usuario.service';

export const rolePermissionGuard: CanMatchFn = (route, segments) => {
  const rolService = inject(RolService);
  const userService = inject(UsuarioService);
  const router = inject(Router);
  const alerts = inject(AlertsService);

  const permiso = route.data?.['permiso'];

  const token = localStorage.getItem('token');
  const decodedToken = JSON.parse(atob(token?.split('.')[1] || ''));
  const uid = decodedToken.uid;

  return userService.getOneUsuario(uid).pipe(
    mergeMap((response) => {
      const rol = response.idRol;

      return rolService.getRolPermisos(rol).pipe(
        mergeMap((response) => {
          const permisos = response.idPermiso?.map((rolPermiso) => rolPermiso.permiso?.nombrePermiso) || [];

          const hasPermission = permisos.includes(permiso);

          if (hasPermission) {
            return of(true);
          } else {
            router.navigate(['acceso-denegado']);
            return of(false);
          }
        })
      );
    })
  );
};