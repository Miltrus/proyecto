import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { UsuarioService } from '../../../services/api/usuario/usuario.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { UsuarioInterface } from 'src/app/models/usuario.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { EstadoUsuarioInterface } from 'src/app/models/estado-usuario.interface';
import { RolInterface } from 'src/app/models/rol.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent, ConfirmDialogData } from '../../../components/dialog-confirm/dialog-confirm.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';


@Component({
  selector: 'app-list-usuarios',
  templateUrl: './list-usuarios.component.html',
  styleUrls: ['./list-usuarios.component.scss']
})
export class ListUsuariosComponent implements OnInit {

  constructor(
    private api: UsuarioService,
    private router: Router,
    private alerts: AlertsService,
    private dialog: MatDialog,
  ) { }

  usuarios: UsuarioInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = [];
  estadosUsuario: EstadoUsuarioInterface[] = [];
  rolUsuario: RolInterface[] = [];
  dataSource = new MatTableDataSource(this.usuarios); //pal filtro
  loading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento
  @ViewChild('viewUsuarioDialog') viewUsuarioDialog!: TemplateRef<any>; // Referencia al cuadro emergente de vista de usuario

  ngOnInit(): void {
    this.api.getAllUsuarios().subscribe(data => {
      this.usuarios = data;
      if (this.usuarios.length < 1) {
        this.alerts.showInfo('No hay usuarios registrados', 'Sin registros');
      }
      this.dataSource.data = this.usuarios; //actualizamos el datasource ya que inicialmente contiene el arreglo vacio de clientes
      this.loading = false;
    });

    this.api.getTipoDocumento().subscribe(data => {
      this.tiposDocumento = data;
      this.loading = false;
    });

    this.api.getEstadoUsuario().subscribe(data => {
      this.estadosUsuario = data;
      this.loading = false;
    });

    this.api.getRolUsuario().subscribe(data => {
      this.rolUsuario = data;
      this.loading = false;
    });
  }

  ngAfterViewInit() { //para la paginacion
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  viewUsuario(usuario: UsuarioInterface): void {
    this.dialog.open(this.viewUsuarioDialog, {
      data: usuario,
      width: '400px', // Ajusta el ancho del cuadro emergente según tus necesidades
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
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Estás seguro de que deseas eliminar este usuario?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.api.deleteUsuario(id).subscribe(data => {
          let respuesta: ResponseInterface = data;

          if (respuesta.status == 'ok') {
            this.alerts.showSuccess('El usuario ha sido eliminado exitosamente', 'Eliminación exitosa');
            this.usuarios = this.usuarios.filter(usuario => usuario.documentoUsuario !== id);
            this.dataSource.data = this.usuarios; //actualizamos el datasource
          } else {
            this.alerts.showError(respuesta.msj, 'Error en la Eliminación');
          }
          this.loading = false;
        });
      } else {
        this.alerts.showInfo('El usuario no ha sido eliminado', 'Eliminacion cancelada');
        this.loading = false;
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


  toggleEstado(usuario: UsuarioInterface): void {
    const nuevoEstado = parseInt(usuario.idEstado, 10) === 1 ? 2 : 1;
    const { contrasenaUsuario, ...userWithOutPwd } = usuario;
    const updatedUsuario: UsuarioInterface = { ...userWithOutPwd, idEstado: nuevoEstado };

    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: `¿Estás seguro que deseas cambiar el estado del usuario?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.api.putUsuario(updatedUsuario).subscribe(data => {
          let respuesta: ResponseInterface = data;

          if (respuesta.status === 'ok') {
            this.alerts.showSuccess('El estado del usuario ha sido actualizado exitosamente', 'Actualización exitosa');
            this.usuarios = this.usuarios.map(u => (u.documentoUsuario === updatedUsuario.documentoUsuario ? updatedUsuario : u));
            this.dataSource.data = this.usuarios; // actualizamos el datasource
          } else {
            this.alerts.showError(respuesta.msj, 'Error en la actualización');
          }
          this.loading = false;
        });
      } else {
        this.alerts.showInfo('No se ha realizado ningún cambio', 'Actualización cancelada');
        this.loading = false;
      }
    });
  }
}