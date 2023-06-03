import { Component, OnInit, ViewChild } from '@angular/core';
import { ClienteService } from '../../../services/api/cliente/cliente.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { ClienteInterface } from 'src/app/models/cliente.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent, ConfirmDialogData } from '../../../components/dialog-confirm/dialog-confirm.component';
import { LoadingComponent } from 'src/app/components/loading/loading.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LoginComponent } from 'src/app/components/login/login.component';


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
    private dialog: MatDialog,
    private auth: LoginComponent,
  ) { }

  clientes: ClienteInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = [];
  dataSource = new MatTableDataSource(this.clientes); //pal filtro

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento

  ngOnInit(): void {
    this.auth.checkLocalStorage();

    this.api.getAllClientes().subscribe(data => { 
      this.clientes = data;
      this.dataSource.data = this.clientes; //actualizamos el datasource ya que inicialmente contiene el arreglo vacio de clientes
    });

    this.api.getTipoDocumento().subscribe(data => {
      this.tiposDocumento = data;
    });
  }

  ngAfterViewInit() { //para la paginacion y el ordenamiento
    this.dataSource.paginator = this.paginator; 
    this.dataSource.sort = this.sort;
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
            this.dataSource.data = this.clientes; // Actualizar el dataSource con los nuevos datos
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
