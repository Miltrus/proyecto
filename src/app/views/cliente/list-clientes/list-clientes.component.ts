import { Component, OnInit } from '@angular/core';
import { ClienteService } from '../../../services/api/cliente/cliente.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { ClienteInterface } from 'src/app/models/cliente.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent, ConfirmDialogData } from '../../../components/dialog-confirm/dialog-confirm.component';
import { LoadingComponent } from 'src/app/components/loading/loading.component';

@Component({
  selector: 'app-list-clientes',
  templateUrl: './list-clientes.component.html',
  styleUrls: ['./list-clientes.component.scss']
})
export class ListClientesComponent implements OnInit {

  constructor(
    private api: ClienteService,
    private router: Router,
    private alerts: AlertsService,
    private dialog: MatDialog
  ) { }

  clientes: ClienteInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = [];

  ngOnInit(): void {
    this.api.getAllClientes().subscribe(data => {
      this.clientes = data;
    });
    this.api.getTipoDocumento().subscribe(data => {
      this.tiposDocumento = data;
    });
    this.checkLocalStorage();
  }

  checkLocalStorage() {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['login']);
    }
  }

  editCliente(id: any) {
    this.router.navigate(['edit-cliente', id]);
  }

  newCliente() {
    this.router.navigate(['new-cliente']);
  }

  deleteCliente(id: any): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Estás seguro de que deseas eliminar este cliente?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.deleteCliente(id).subscribe(data => {
          let respuesta: ResponseInterface = data;

          if (respuesta.status == 'ok') {
            this.alerts.showSuccess('El cliente ha sido eliminado exitosamente.', 'Eliminación Exitosa');
            this.clientes = this.clientes.filter(cliente => cliente.documentoCliente !== id);
          } else {
            this.alerts.showError(respuesta.msj, 'Error en la Eliminación');
          }
        });
      }
    });
  }

  getTipoDocumento(idTipoDocumento: any): string {
    const tipoDocumento = this.tiposDocumento.find(tipo => tipo.idTipoDocumento === idTipoDocumento);
    return tipoDocumento?.nombreTipo || '';
  }

  goBack() {
    this.router.navigate(['dashboard']);
  }
}
