import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { RolService } from 'src/app/services/api/rol/rol.service';

export const rolePermissionGuard: CanMatchFn = (route, segments) => {
  const router = inject(Router);
  const rolService = inject(RolService);

  const idRol = localStorage.getItem('rolId');
  const modules = route.data?.['modules'] || [];

  return rolService.getRolPermisos(idRol).pipe(
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
};
