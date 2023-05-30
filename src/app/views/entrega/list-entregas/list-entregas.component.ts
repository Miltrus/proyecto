import { Component, OnInit, ViewChild } from '@angular/core';
import { EntregaService } from '../../../services/api/entrega/entrega.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { EntregaInterface } from 'src/app/models/entrega.interface';
import { ListaPaqueteInterface } from 'src/app/models/lista-paquete.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent, ConfirmDialogData } from '../../../components/dialog-confirm/dialog-confirm.component';
import { LoadingComponent } from 'src/app/components/loading/loading.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';


@Component({
  selector: 'app-list-entregas',
  templateUrl: './list-entregas.component.html',
  styleUrls: ['./list-entregas.component.scss']
})
export class ListEntregasComponent implements OnInit {

  constructor(
    private api: EntregaService,
    private router: Router,
    private alerts: AlertsService,
    private dialog: MatDialog
  ) { }

  entregas: EntregaInterface[] = [];
  listaPaquete: ListaPaqueteInterface[] = [];
  dataSource = new MatTableDataSource(this.entregas); //pal filtro

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento

  ngOnInit(): void {
    this.checkLocalStorage();

    this.api.getAllEntregas().subscribe(data => {
      this.entregas = data;
      this.dataSource.data = this.entregas; //actualizamos el datasource ya que inicialmente contiene el arreglo vacio de clientes
    });

    this.api.getListaPaquete().subscribe(data => {
      this.listaPaquete = data;
    });
  }

  ngAfterViewInit() { //para la paginacion y el ordenamiento
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  checkLocalStorage() {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['login']);
    }
  }

  /* editEntrega(id: any) {
    this.router.navigate(['edit-entrega', id]);
  } */

  /* newCliente() {
    this.router.navigate(['new-cliente']);
  } */

  deleteEntrega(id: any): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Estás seguro de que deseas eliminar la entrega?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.deleteEntrega(id).subscribe(data => {
          let respuesta: ResponseInterface = data;
          if (respuesta.status == 'ok') {
            this.alerts.showSuccess('La entrega ha sido eliminado exitosamente.', 'Eliminación Exitosa');
            this.entregas = this.entregas.filter(entrega => entrega.idEntrega !== id);
            this.dataSource.data = this.entregas; // Actualizar el dataSource con los nuevos datos
          } else {
            this.alerts.showError(respuesta.msj, 'Error en la Eliminación');
          }
        });
      }
    });
  }

  getListaPaquete(idLista: any): string {
    const lista = this.listaPaquete.find(lista => lista.idLista === idLista);
    return lista?.idPaquete || '';
  }

  goBack() {
    this.router.navigate(['dashboard']);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
