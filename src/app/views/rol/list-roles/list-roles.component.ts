import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { RolService } from '../../../services/api/rol.service';
import { Router } from '@angular/router';
import { ResponseInterface } from 'src/app/models/response.interface';
import { RolInterface } from 'src/app/models/rol.interface';
import { PermisoInterface } from 'src/app/models/permiso.interface';
import { RolPermisoInterface } from 'src/app/models/rol-permiso.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-list-roles',
  templateUrl: './list-roles.component.html',
  styleUrls: ['./list-roles.component.scss']
})
export class ListRolesComponent implements OnInit, OnDestroy {

  constructor(
    private api: RolService,
    private router: Router,
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
        Swal.fire({
          icon: 'info',
          title: 'No hay roles registrados',
          text: 'No se encontraron roles registrados en el sistema.',
        });
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
    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro que deseas eliminar este rol?',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.api.deleteRol(id).subscribe(data => {
          let respuesta: ResponseInterface = data;
          if (respuesta.status == 'ok') {
            this.roles = this.roles.filter(rol => rol.idRol !== id);
            this.dataSource.data = this.roles;
            Swal.fire({
              icon: 'success',
              title: 'Rol eliminado',
              text: 'El rol ha sido eliminado exitosamente.',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar',
              text: respuesta.msj,
            });
          }
          this.loading = false;
        });
      }
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
