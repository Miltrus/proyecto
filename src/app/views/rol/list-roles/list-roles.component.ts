import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { RolService } from '../../../services/api/rol/rol.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { RolInterface } from 'src/app/models/rol.interface';
import { PermisoInterface } from 'src/app/models/permiso.interface';
import { RolPermisoInterface } from 'src/app/models/rol-permiso.interface';
import { RolPermisoResponseInterface } from 'src/app/models/rol-permiso-response.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';

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
    private dialog: MatDialog,
  ) { }

  roles: RolInterface[] = [];
  dataSource: MatTableDataSource<RolInterface> = new MatTableDataSource();
  loading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento
  @ViewChild('viewRolDialog') viewRolDialog!: TemplateRef<any>; // Referencia al cuadro emergente de vista de rol

  ngOnInit(): void {
    this.loadRoles();
  }

  ngAfterViewInit() { //para la paginacion
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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

        if (this.roles.length < 1) {
          this.alerts.showInfo('No hay roles registrados', 'Sin registros');
        }

      },
      (error) => {
        console.log(error);
        this.loading = false;
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

        this.loading = false;
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
    this.loading = true;
    this.router.navigate(['rol/edit-rol', id]);
  }

  newRol(): void {
    this.loading = true;
    this.router.navigate(['rol/new-rol']);
  }

  deleteRol(id: any): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Estás seguro de que deseas eliminar este rol?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.api.deleteRol(id).subscribe(data => {
          let respuesta: ResponseInterface = data;

          if (respuesta.status == 'ok') {
            this.alerts.showSuccess('El rol ha sido eliminado', 'Eliminación exitosa');
            this.roles = this.roles.filter(rol => rol.idRol !== id);
            this.dataSource.data = this.roles;
          } else {
            this.alerts.showError(respuesta.msj, 'Error en la eliminación');
          }
          this.loading = false;
        });
      }
      this.loading = false;
    });
  }

  goBack(): void {
    this.loading = true;
    this.router.navigate(['dashboard']);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
