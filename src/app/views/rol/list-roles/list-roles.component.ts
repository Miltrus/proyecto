import { Component, OnInit } from '@angular/core';
import { RolService } from '../../../services/api/rol/rol.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { RolInterface } from 'src/app/models/rol.interface';
import { LoginComponent } from 'src/app/components/login/login.component';
import { PermisoInterface } from 'src/app/models/permiso.interface';
import { RolPermisoInterface } from 'src/app/models/rol-permiso.interface';

@Component({
  selector: 'app-list-roles',
  templateUrl: './list-roles.component.html',
  styleUrls: ['./list-roles.component.scss']
})
export class ListRolesComponent implements OnInit {

  constructor(
    private rolService: RolService,
    private router: Router,
    private alerts: AlertsService,
    private auth: LoginComponent
  ) {}

  roles: RolInterface[] = [];
  rolesPermisos: RolPermisoInterface[] = [];

  ngOnInit(): void {
    this.auth.checkLocalStorage();
    this.loadRoles();
  }

  loadRoles(): void {
    this.rolService.getAllRoles().subscribe(
      (data: RolInterface[]) => {
        this.roles = data;
        this.loadPermisosPorRol();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  loadPermisosPorRol(): void {
    this.roles.forEach((rolesPermisos: RolPermisoInterface) => {
      this.rolService.getRolPermisos(rolesPermisos.idRol).subscribe(
        (data: RolPermisoInterface[]) => {
          const permisos: PermisoInterface[] = data.map((rolPermiso: RolPermisoInterface) => rolPermiso.idPermiso);
          rolesPermisos.idPermiso = permisos;
        },
        (error) => {
          console.log(error);
        }
      );
    });
  }

  editRol(id: any): void {
    this.router.navigate(['edit-rol', id]);
  }

  newRol(): void {
    this.router.navigate(['new-rol']);
  }

  deleteRol(id: any): void {
    if (confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      this.rolService.deleteRol(id).subscribe(
        (data: ResponseInterface) => {
          if (data.status === 'ok') {
            this.alerts.showSuccess('El rol ha sido eliminado exitosamente.', 'Eliminación Exitosa');
            this.loadRoles();
          } else {
            this.alerts.showError('No se pudo eliminar el rol. Inténtalo nuevamente.', 'Error en la Eliminación');
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  goBack(): void {
    this.router.navigate(['dashboard']);
  }
}
