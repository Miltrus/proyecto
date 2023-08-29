import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { RastreoInterface } from 'src/app/models/rastreo.interface';
import { RastreoService } from 'src/app/services/api/rastreo.service';
import { EstadoRastreoInterface } from 'src/app/models/estado-rastreo.interface';
import { Subscription, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { PaqueteService } from 'src/app/services/api/paquete.service';
import { PaqueteInterface } from 'src/app/models/paquete.interface';

@Component({
  selector: 'app-list-novedades',
  templateUrl: './list-novedades.component.html',
  styleUrls: ['./list-novedades.component.scss']
})
export class ListNovedadesComponent implements OnInit {

  constructor(
    private api: RastreoService,
    private apiPaquete: PaqueteService,
    private router: Router,
    private dialog: MatDialog,
  ) { }

  private subscriptions: Subscription = new Subscription();

  novedades: RastreoInterface[] = [];
  estados: EstadoRastreoInterface[] = [];
  paquetes: PaqueteInterface[] = [];
  dataSource = new MatTableDataSource(this.novedades); //pal filtro
  loading: boolean = true;
  dataToExport: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento
  @ViewChild('viewNovedadDialog') viewNovedadDialog!: TemplateRef<any>; // Referencia al cuadro emergente de vista de usuario

  ngOnInit(): void {
    this.loading = true;

    const forkJoinSub = forkJoin([
      this.api.getAllRastreos(),
      this.api.getEstadoRastreo(),
      this.apiPaquete.getAllPaquetes()
    ]).subscribe(([novedad, estado, paquete]) => {
      this.novedades = novedad.filter(item => item.idEstado == 2); // Filtrar por idEstado igual a 2
      this.dataSource.data = this.novedades;
      if (this.dataSource.data.length < 1) {
        Swal.fire({
          title: 'No hay novedades registradas',
          text: 'No se encontraron novedades en el sistema.',
          icon: 'info',
          toast: true,
          showConfirmButton: false,
          timer: 5000,
          position: 'top-end',
          timerProgressBar: true,
          showCloseButton: true
        })
      }
      this.estados = estado;
      this.paquetes = paquete;
      this.loading = false;
    },
      error => {
        console.log(error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo obtener la información de las novedades.',
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

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  viewNovedad(novedad: RastreoInterface): void {
    this.dialog.open(this.viewNovedadDialog, {
      data: novedad,
      width: '400px',
    });
  }

  getPaquete(idPaquete: any): any {
    const paquete = this.paquetes.find(tipo => tipo.idPaquete === idPaquete);
    return paquete || '';
  }

  getEstado(idEstado: any): string {
    const estado = this.estados.find(tipo => tipo.idEstado === idEstado);
    return estado?.nombreEstado || '';
  }
}
