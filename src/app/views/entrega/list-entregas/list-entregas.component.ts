import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EntregaInterface } from 'src/app/models/entrega.interface';
import { RastreoInterface } from 'src/app/models/rastreo.interface';
import { EntregaService } from 'src/app/services/api/entrega.service';
import { Subscription, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { PaqueteInterface } from 'src/app/models/paquete.interface';
import { PaqueteService } from 'src/app/services/api/paquete.service';
import { RastreoService } from 'src/app/services/api/rastreo.service';

@Component({
  selector: 'app-list-entregas',
  templateUrl: './list-entregas.component.html',
  styleUrls: ['./list-entregas.component.scss']
})
export class ListEntregasComponent implements OnInit {
  constructor(
    private api: EntregaService,
    private apiRastreo: RastreoService,
    private apiPaquete: PaqueteService,
    private dialog: MatDialog,
  ) { }

  private subscriptions: Subscription = new Subscription();

  entregas: any[] = [];
  rastreos: RastreoInterface[] = [];
  paquetes: PaqueteInterface[] = [];
  dataSource = new MatTableDataSource(this.entregas); //pal filtro
  loading: boolean = true;
  dataToExport: any[] = [];
  base64UrlToShow: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento
  @ViewChild('viewEntregaDialog') viewEntregaDialog!: TemplateRef<any>; // Referencia al cuadro emergente de vista de usuario
  @ViewChild('viewFirma') viewFirma!: TemplateRef<any>;

  ngOnInit(): void {

    this.loading = true;

    const forkJoinSub = forkJoin([
      this.api.getAllEntregas(),
      this.apiRastreo.getRastreosByEntregado(),
      this.apiPaquete.getPaquetesByEntregado()
    ]).subscribe(([entrega, rastreo, paquete]) => {
      this.entregas = entrega;
      this.dataSource.data = this.entregas;
      if (this.dataSource.data.length < 1) {
        Swal.fire({
          title: 'No hay entregas registradas',
          text: 'No se encontraron entregas en el sistema.',
          icon: 'info',
          toast: true,
          showConfirmButton: false,
          timer: 5000,
          position: 'top-end',
          timerProgressBar: true,
          showCloseButton: true
        })
      }
      this.rastreos = rastreo;
      this.paquetes = paquete;
      this.loading = false;
    },
      error => {
        console.log(error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo obtener la información de las entregas.',
          icon: 'error',
          toast: true,
          showConfirmButton: false,
          timer: 5000,
          position: 'top-end',
          timerProgressBar: true,
          showCloseButton: true
        })
      });
    this.subscriptions.add(forkJoinSub);
  }

  openImageViewer(imgData: any): void {
    this.dialog.open(this.viewFirma, {
      data: { imgData },
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  viewEntrega(entrega: EntregaInterface): void {
    this.dialog.open(this.viewEntregaDialog, {
      data: entrega,
      width: '400px',
    });
  }

  getRastreo(idRastreo: any): any {
    const rastreo = this.rastreos.find(tipo => tipo.idRastreo === idRastreo);
    return this.getPaquete(rastreo?.idPaquete);
  }

  getPaquete(idPaquete: any): any {
    const paquete = this.paquetes.find(tipo => tipo.idPaquete === idPaquete);
    return paquete;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
