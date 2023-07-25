import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { UsuarioService } from '../../../services/api/usuario.service';
import { Router } from '@angular/router';
import { ResponseInterface } from 'src/app/models/response.interface';
import { UsuarioInterface } from 'src/app/models/usuario.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { EstadoUsuarioInterface } from 'src/app/models/estado-usuario.interface';
import { RolInterface } from 'src/app/models/rol.interface';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-list-usuarios',
  templateUrl: './list-usuarios.component.html',
  styleUrls: ['./list-usuarios.component.scss']
})
export class ListUsuariosComponent implements OnInit, OnDestroy {

  constructor(
    private api: UsuarioService,
    private router: Router,
    private dialog: MatDialog,
  ) { }

  private subscriptions: Subscription = new Subscription();

  usuarios: UsuarioInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = [];
  estadosUsuario: EstadoUsuarioInterface[] = [];
  rolUsuario: RolInterface[] = [];
  dataSource = new MatTableDataSource(this.usuarios); //pal filtro
  loading: boolean = true;

  token = localStorage.getItem('token');
  decodedToken = JSON.parse(atob(this.token!.split('.')[1]));
  uid = this.decodedToken.uid;

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento
  @ViewChild('viewUsuarioDialog') viewUsuarioDialog!: TemplateRef<any>; // Referencia al cuadro emergente de vista de usuario

  ngOnInit(): void {
    const getAllUsuarios$ = this.api.getAllUsuarios();
    const getTipoDocumento$ = this.api.getTipoDocumento();
    const getEstadoUsuario$ = this.api.getEstadoUsuario();
    const getRolUsuario$ = this.api.getRolUsuario();

    const forkJoinSub = forkJoin([getAllUsuarios$, getTipoDocumento$, getEstadoUsuario$, getRolUsuario$]).subscribe(
      ([usuarios, tiposDocumento, estadosUsuario, rolUsuario]) => {
        this.usuarios = usuarios;
        this.tiposDocumento = tiposDocumento;
        this.estadosUsuario = estadosUsuario;
        this.rolUsuario = rolUsuario;
        this.dataSource.data = this.usuarios;
        this.loading = false;
      },
      (error) => {
        console.error(error);
        this.loading = false;
      }
    );
    this.subscriptions.add(forkJoinSub);
  }

  ngAfterViewInit() { //para la paginacion
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this.subscriptions.unsubscribe();
  }

  viewUsuario(usuario: UsuarioInterface): void {
    this.dialog.open(this.viewUsuarioDialog, {
      data: usuario,
      width: '400px',
    });
  }

  editUsuario(id: any) {
    this.loading = true;

    this.router.navigate(['usuario/edit-usuario', id]);
  }

  newUsuario() {
    this.loading = true;
    this.router.navigate(['usuario/new-usuario']);
  }

  deleteUsuario(id: any): void {
    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro de que deseas eliminar este usuario?',
      showCancelButton: true,
      showCloseButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        if (id == this.uid) {
          Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'No puedes eliminar tu propio usuario.',
          });
          this.loading = false;
          return;
        }
        const delUserSUb = this.api.deleteUsuario(id).subscribe(data => {
          let respuesta: ResponseInterface = data;

          if (respuesta.status == 'ok') {
            this.usuarios = this.usuarios.filter(usuario => usuario.idUsuario !== id);
            this.dataSource.data = this.usuarios; // Actualizamos el dataSource con los nuevos datos
            Swal.fire({
              icon: 'success',
              title: 'Usuario eliminado',
              text: 'El usuario ha sido eliminado exitosamente.',
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
        this.subscriptions.add(delUserSUb);
      }
    });
  }



  toggleEstado(usuario: UsuarioInterface): void {
    const nuevoEstado = parseInt(usuario.idEstado, 10) === 1 ? 2 : 1;
    const { contrasenaUsuario, ...userWithOutPwd } = usuario;
    const updatedUsuario: UsuarioInterface = { ...userWithOutPwd, idEstado: nuevoEstado };

    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro de que deseas cambiar el estado de este usuario?',
      showCancelButton: true,
      showCloseButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        if (usuario.idUsuario == this.uid) {
          Swal.fire({
            icon: 'warning',
            title: 'Acceso denegado',
            text: 'No puedes cambiar el estado de tu propio usuario.',
          });
          this.loading = false;
          return;
        }

        const putUserSub = this.api.putUsuario(updatedUsuario).subscribe(data => {
          let respuesta: ResponseInterface = data;

          if (respuesta.status === 'ok') {
            this.usuarios = this.usuarios.map(u => (u.documentoUsuario === updatedUsuario.documentoUsuario ? updatedUsuario : u));
            this.dataSource.data = this.usuarios; // Actualizamos el dataSource con los nuevos datos
            Swal.fire({
              icon: 'success',
              title: 'Usuario actualizado',
              text: 'El estado del usuario ha sido actualizado exitosamente.',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al actualizar',
              text: respuesta.msj,
            });
          }
          this.loading = false;
        });
        this.subscriptions.add(putUserSub);
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Actualización cancelada',
          text: 'No se ha realizado ningún cambio.',
        });
      }
    });
  }



  getTipoDocumento(idTipoDocumento: any): string {
    const tipoDocumento = this.tiposDocumento.find(tipo => tipo.idTipoDocumento === idTipoDocumento);
    return tipoDocumento?.nombreTipo || '';
  }

  getEstadoUsuario(idEstado: any): string {
    const estadoUsuario = this.estadosUsuario.find(estado => estado.idEstado === idEstado);
    return estadoUsuario?.estadoUsuario || '';
  }

  getRolUsuario(idRol: any): string {
    const rolUsuario = this.rolUsuario.find(rol => rol.idRol === idRol);
    return rolUsuario?.nombreRol || '';
  }

  goBack() {
    this.loading = true;
    this.router.navigate(['dashboard']);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}