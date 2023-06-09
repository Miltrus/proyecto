import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ClienteService } from '../../../services/api/cliente.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { ClienteInterface } from 'src/app/models/cliente.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from '../../../components/dialog-confirm/dialog-confirm.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription, forkJoin } from 'rxjs';


@Component({
  selector: 'app-list-clientes',
  templateUrl: './list-clientes.component.html',
  styleUrls: ['./list-clientes.component.scss']
})
export class ListClientesComponent implements OnInit, OnDestroy {

  constructor(
    private api: ClienteService,
    private router: Router,
    private alerts: AlertsService,
    private dialog: MatDialog,
  ) { }

  private subscriptions: Subscription = new Subscription();

  clientes: ClienteInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = [];
  dataSource = new MatTableDataSource(this.clientes); //pal filtro
  loading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento
  @ViewChild('viewClienteDialog') viewClienteDialog!: TemplateRef<any>; // Referencia al cuadro emergente de vista de usuario

  ngOnInit(): void {
    this.loading = true;

    const forkJoinSub = forkJoin([
      this.api.getAllClientes(),
      this.api.getTipoDocumento()
    ]).subscribe(([clientes, tiposDocumento]) => {
      this.clientes = clientes;
      this.dataSource.data = this.clientes;
      if (this.dataSource.data.length < 1) {
        this.alerts.showInfo('No hay clientes registrados', 'Sin registros');
      }
      this.tiposDocumento = tiposDocumento;
      this.loading = false;
    });
    this.subscriptions.add(forkJoinSub);
  }

  ngAfterViewInit() { //para la paginacion y el ordenamiento
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this.subscriptions.unsubscribe();
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
            this.clientes = this.clientes.filter(cliente => cliente.idCliente !== id);
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
  }
}
