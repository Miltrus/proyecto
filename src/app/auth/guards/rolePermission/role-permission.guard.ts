import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { RolService } from 'src/app/services/api/rol/rol.service';
import { UsuarioService } from 'src/app/services/api/usuario/usuario.service';

export const rolePermissionGuard: CanMatchFn = (route, segments) => {
  const rolService = inject(RolService);
  const userService = inject(UsuarioService);

  const token = localStorage.getItem('token');
  const decodedToken = JSON.parse(atob(token?.split('.')[1] || ''));
  const uid = decodedToken.uid;

  return userService.getOneUsuario(uid).pipe(
    mergeMap((response) => {

      const rol = response.idRol;

      const modules = route.data?.['modules'] || [];

      return rolService.getRolPermisos(rol).pipe(
        mergeMap((response) => {
          const permisos = response.idPermiso?.map((rolPermiso) => rolPermiso.permiso?.nombrePermiso) || [];

          const hasPermission = permisos.some((permiso) =>
            modules.some((modulo: any) => modulo.name.toLowerCase() === permiso?.toLowerCase())
          );

          if (hasPermission) {
            return of(true);
          } else {
            return of(false);
          }
        })
      );
    })
  );
};
