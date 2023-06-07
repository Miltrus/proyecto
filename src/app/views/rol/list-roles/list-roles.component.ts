import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { RolService } from '../../../services/api/rol/rol.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { RolInterface } from 'src/app/models/rol.interface';
import { LoginComponent } from 'src/app/components/login/login.component';
import { PermisoInterface } from 'src/app/models/permiso.interface';
import { RolPermisoInterface } from 'src/app/models/rol-permiso.interface';
import { RolPermisoResponseInterface } from 'src/app/models/rol-permiso-response.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-list-roles',
  templateUrl: './list-roles.component.html',
  styleUrls: ['./list-roles.component.scss']
})
export class ListRolesComponent implements OnInit {

  constructor(
    private api: RolService,
    private router: Router,
    private alerts: AlertsService,
    private auth: LoginComponent,
    private dialog: MatDialog,
  ) {}

  roles: RolInterface[] = [];
  dataSource: MatTableDataSource<RolInterface> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('viewRolDialog') viewRolDialog!: TemplateRef<any>; // Referencia al cuadro emergente de vista de rol

  ngOnInit(): void {
    this.auth.checkLocalStorage();
    this.loadRoles();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadRoles(): void {
    this.api.getAllRoles().subscribe(
      (data: RolInterface[]) => {
        this.roles = data;
        this.dataSource.data = this.roles;

        // Obtener los permisos por cada rol
        data.forEach((rol: RolInterface) => {
          this.loadPermisosPorRol(rol.idRol);
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  loadPermisosPorRol(idRol: string): void {
    this.api.getRolPermisos(idRol).subscribe(
      (data: RolPermisoResponseInterface) => {
        const permisos: PermisoInterface[] = data.idPermiso
          ? data.idPermiso.filter((rolPermiso: RolPermisoInterface | null | undefined) => rolPermiso !== null && rolPermiso !== undefined)
            .map((rolPermiso: RolPermisoInterface) => rolPermiso.permiso!)
          : [];

        // Encuentra el rol correspondiente en el arreglo 'roles'
        const rol = this.roles.find((r: RolInterface) => r.idRol === idRol);

        // Asigna los permisos al rol encontrado
        if (rol) {
          rol.permisos = permisos;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  viewRol(rol: RolInterface): void {
    this.dialog.open(this.viewRolDialog, {
      data: rol,
      width: '400px', // Ajusta el ancho del cuadro emergente según tus necesidades
    });
  }

  editRol(id: any): void {
    this.router.navigate(['edit-rol', id]);
  }

  newRol(): void {
    this.router.navigate(['new-rol']);
  }

  deleteRol(id: any): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Estás seguro de que deseas eliminar este usuario?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.deleteRol(id).subscribe(data => {
          let respuesta: ResponseInterface = data;

          if (respuesta.status == 'ok') {
            this.alerts.showSuccess('El usuario ha sido eliminado exitosamente.', 'Eliminación Exitosa');
            this.roles = this.roles.filter(rol => rol.idRol !== id);
            this.dataSource.data = this.roles;
          } else {
            this.alerts.showError(respuesta.msj, 'Error en la Eliminación');
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['dashboard']);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
