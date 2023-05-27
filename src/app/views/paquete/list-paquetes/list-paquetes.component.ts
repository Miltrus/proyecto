import { Component, OnInit } from '@angular/core';
import { PaqueteService } from '../../../services/api/paquete/paquete.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { PaqueteInterface } from 'src/app/models/paquete.interface';
import { UsuarioInterface } from 'src/app/models/usuario.interface';
import { ClienteInterface } from 'src/app/models/cliente.interface';
import { EstadoPaqueteInterface } from 'src/app/models/estado-paquete.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent, ConfirmDialogData } from '../../../templates/dialog-confirm/dialog-confirm.component';

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
    private dialog: MatDialog
  ) { }

  paquetes: PaqueteInterface[] = [];
  usuario: UsuarioInterface[] = [];
  cliente: ClienteInterface[] = [];
  estadosPaquete: EstadoPaqueteInterface[] = [];

  ngOnInit(): void {
    this.api.getAllPaquetes().subscribe(data => {
      this.paquetes = data;
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
    this.checkLocalStorage();
  }

  checkLocalStorage() {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['login']);
    }
  }

  editPaquete(id: any) {
    this.router.navigate(['edit-paquete', id]);
  }

  newPaquete() {
    this.router.navigate(['new-paquete']);
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
}
