import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ClienteService } from '../../../services/api/cliente/cliente.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { ClienteInterface } from 'src/app/models/cliente.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent, ConfirmDialogData } from '../../../components/dialog-confirm/dialog-confirm.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';


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
  ) { }

  clientes: ClienteInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = [];
  dataSource = new MatTableDataSource(this.clientes); //pal filtro
  loading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento
  @ViewChild('viewClienteDialog') viewClienteDialog!: TemplateRef<any>; // Referencia al cuadro emergente de vista de usuario

  ngOnInit(): void {

    this.api.getAllClientes().subscribe(data => {
      this.clientes = data;
      if (this.clientes.length === 0) {
        this.alerts.showInfo('No hay clientes registrados', 'Sin registros');
      }
      this.dataSource.data = this.clientes; //actualizamos el datasource ya que inicialmente contiene el arreglo vacio de clientes
      this.loading = false;
    });

    this.api.getTipoDocumento().subscribe(data => {
      this.tiposDocumento = data;
      this.loading = false;
    });
  }

  ngAfterViewInit() { //para la paginacion y el ordenamiento
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  viewCliente(usuario: ClienteInterface): void {
    this.dialog.open(this.viewClienteDialog, {
      data: usuario,
      width: '400px', // Ajusta el ancho del cuadro emergente según tus necesidades
    });
  }

  editCliente(id: any) {
    this.loading = true;
    this.router.navigate(['cliente/edit-cliente', id]);
  }

  newCliente() {
    this.loading = true;
    this.router.navigate(['cliente/new-cliente']);
  }

  deleteCliente(id: any): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Estás seguro que deseas eliminar este cliente?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.api.deleteCliente(id).subscribe(data => {
          let respuesta: ResponseInterface = data;
          if (respuesta.status == 'ok') {
            this.alerts.showSuccess('El cliente ha sido eliminado', 'Eliminación exitosa');
            this.clientes = this.clientes.filter(cliente => cliente.documentoCliente !== id);
            this.dataSource.data = this.clientes; // Actualizar el dataSource con los nuevos datos
          } else {
            this.alerts.showError(respuesta.msj, 'Error en la eliminación');
          }
          this.loading = false;
        });
      } else {
        this.alerts.showInfo('No se ha realizado ninguna accion', 'Eliminacion cancelada');
        this.loading = false;
      }
    });
  }

  getTipoDocumento(idTipoDocumento: any): string {
    const tipoDocumento = this.tiposDocumento.find(tipo => tipo.idTipoDocumento === idTipoDocumento);
    return tipoDocumento?.nombreTipo || '';
  }

  goBack() {
    this.loading = true;
    this.router.navigate(['dashboard']);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    console.log(this.dataSource.filter);
    console.log(this.dataSource);

  }
}
