import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ClienteService } from '../../../services/api/cliente.service';
import { Router } from '@angular/router';
import { ClienteInterface } from 'src/app/models/cliente.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-list-clientes',
  templateUrl: './list-clientes.component.html',
  styleUrls: ['./list-clientes.component.scss']
})
export class ListClientesComponent implements OnInit, OnDestroy {

  constructor(
    private api: ClienteService,
    private router: Router,
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
        Swal.fire({
          icon: 'info',
          title: 'No hay clientes registrados',
          text: 'No se encontraron clientes registrados en el sistema.',
        });
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
      width: '400px',
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
    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro de que deseas eliminar este cliente?',
      showDenyButton: true,
      showCancelButton: true,
      showConfirmButton: false,
      reverseButtons: true,
      denyButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isDenied) {
        this.loading = true;
        this.api.deleteCliente(id).subscribe(data => {
          if (data.status == 'ok') {
            this.clientes = this.clientes.filter(cliente => cliente.idCliente !== id);
            this.dataSource.data = this.clientes; // Actualizar el dataSource con los nuevos datos
            Swal.fire({
              icon: 'success',
              title: 'Cliente eliminado',
              text: 'El cliente ha sido eliminado exitosamente.',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar',
              text: data.msj,
            });
          }
          this.loading = false;
        });
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
