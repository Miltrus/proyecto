import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { RolService } from '../../../services/api/rol.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { RolInterface } from 'src/app/models/rol.interface';
import { PermisoInterface } from 'src/app/models/permiso.interface';
import { RolPermisoInterface } from 'src/app/models/rol-permiso.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list-roles',
  templateUrl: './list-roles.component.html',
  styleUrls: ['./list-roles.component.scss']
})
export class ListRolesComponent implements OnInit, OnDestroy {

  constructor(
    private api: RolService,
    private router: Router,
    private alerts: AlertsService,
    private dialog: MatDialog,
  ) { }

  private subscriptions: Subscription = new Subscription();

  roles: RolInterface[] = [];
  dataSource: MatTableDataSource<RolInterface> = new MatTableDataSource();
  loading: boolean = true;
  totalPermisosCargados = 0;

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

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this.subscriptions.unsubscribe();
  }


  loadPermisosPorRol(idRol: string): void {
    const rolPermiSub = this.api.getRolPermisos(idRol).subscribe(data => {
      const permisos: PermisoInterface[] = data.idPermiso
        ? data.idPermiso.filter((rolPermiso: RolPermisoInterface | null | undefined) => rolPermiso !== null && rolPermiso !== undefined)
          .map((rolPermiso: RolPermisoInterface) => rolPermiso.permiso!)
        : [];

      // Encuentra el rol correspondiente en el arreglo 'roles'
      const rol = this.roles.find((r: RolInterface) => r.idRol === idRol);

      // Asigna los permisos al rol encontrado
      if (rol) {
        rol.permisos = permisos;
        this.totalPermisosCargados++;

        if (this.totalPermisosCargados === this.roles.length) {
          this.loading = false;
        }
      }
    });
    this.subscriptions.add(rolPermiSub);
  }

  loadRoles(): void {
    const allRolesSub = this.api.getAllRoles().subscribe(data => {
      this.roles = data;
      this.dataSource.data = this.roles;

      // Obtener los permisos por cada rol
      data.forEach((rol: RolInterface) => {
        this.loadPermisosPorRol(rol.idRol);
      });

      if (this.roles.length < 1) {
        this.alerts.showInfo('No hay roles registrados', 'Sin registros');
        this.loading = false;
      }
    });
    this.subscriptions.add(allRolesSub);
  }

  viewRol(rol: RolInterface): void {
    this.dialog.open(this.viewRolDialog, {
      data: rol,
      width: '400px',
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

    const dialogRefSub = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        const deleteRolSub = this.api.deleteRol(id).subscribe(data => {
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
        this.subscriptions.add(deleteRolSub);
      } else {
        this.alerts.showInfo('El rol no ha sido eliminado', 'Eliminación cancelada');
        this.loading = false;
      }
    });
    this.subscriptions.add(dialogRefSub);
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
