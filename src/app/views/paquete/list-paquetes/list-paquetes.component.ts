import { Component, OnInit, ViewChild } from '@angular/core';
import { PaqueteService } from '../../../services/api/paquete/paquete.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { PaqueteInterface } from 'src/app/models/paquete.interface';
import { UsuarioInterface } from 'src/app/models/usuario.interface';
import { ClienteInterface } from 'src/app/models/cliente.interface';
import { EstadoPaqueteInterface } from 'src/app/models/estado-paquete.interface';
import { MatDialog } from '@angular/material/dialog';

import { DialogConfirmComponent, ConfirmDialogData } from '../../../components/dialog-confirm/dialog-confirm.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LoginComponent } from 'src/app/components/login/login.component';


@Component({
  selector: 'app-list-paquetes',
  templateUrl: './list-paquetes.component.html',
  styleUrls: ['./list-paquetes.component.scss']
})
export class ListPaquetesComponent implements OnInit {

  constructor(
    private api: PaqueteService,
    private router: Router,
    private alerts: AlertsService,
    private dialog: MatDialog,
    private auth: LoginComponent,
  ) { }

  paquetes: PaqueteInterface[] = [];
  usuario: UsuarioInterface[] = [];
  cliente: ClienteInterface[] = [];
  estadosPaquete: EstadoPaqueteInterface[] = [];
  dataSource = new MatTableDataSource(this.paquetes); //pal filtro

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento

  ngOnInit(): void {
    this.auth.checkLocalStorage();
    this.api.getAllPaquetes().subscribe(data => {
      this.paquetes = data;
      this.dataSource.data = this.paquetes; //actualizamos el datasource ya que inicialmente contiene el arreglo vacio de paquetes
    });

    this.api.getUsuario().subscribe(data => {
      this.usuario = data;
    });

    this.api.getCliente().subscribe(data => {
      this.cliente = data;
    });

    this.api.getEstadoPaquete().subscribe(data => {
      this.estadosPaquete = data;
    });
  }

  ngAfterViewInit() { //para la paginacion
    this.dataSource.paginator = this.paginator; 
    this.dataSource.sort = this.sort;
  }
  editPaquete(id: any) {
    this.router.navigate(['paquete/edit-paquete', id]);
  }

  newPaquete() {
    this.router.navigate(['paquete/new-paquete']);
  }

  deletePaquete(id: any): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Estás seguro de que deseas eliminar este paquete?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.deletePaquete(id).subscribe(data => {
          let respuesta: ResponseInterface = data;

          if (respuesta.status == 'ok') {
            this.alerts.showSuccess('El paquete ha sido eliminado exitosamente.', 'Eliminación Exitosa');
            this.paquetes = this.paquetes.filter(paquete => paquete.idPaquete !== id);
            this.dataSource.data = this.paquetes; //actualizamos el datasource
          } else {
            this.alerts.showError(respuesta.msj, 'Error en la Eliminación');
          }
        });
      }
    });
  }

  getUsuarioPaquete(documentoUsuario: any): string {
    const documento = this.usuario.find(documentoU => documentoU.documentoUsuario === documentoUsuario);
    return documento?.nombreUsuario || '';
  }


  getClientePaquete(documentoCliente: any): string {
    const cliente = this.cliente.find(documentoC => documentoC.documentoCliente === documentoCliente);
    return cliente?.nombreCliente || '';
  }

  getEstadoPaquete(idEstado: any): string {
    const estadoPaquete = this.estadosPaquete.find(estado => estado.idEstado === idEstado);
    return estadoPaquete?.estadoPaquete || '';
  }

  goBack() {
    this.router.navigate(['dashboard']);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
