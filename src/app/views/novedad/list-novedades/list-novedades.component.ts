// Importaciones de módulos y clases necesarias
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

  // Arreglos para almacenar datos
  novedades: RastreoInterface[] = [];
  estados: EstadoRastreoInterface[] = [];
  paquetes: PaqueteInterface[] = [];

  // DataSource para la tabla y otras propiedades
  dataSource = new MatTableDataSource(this.novedades); // Para el filtro
  loading: boolean = true;
  dataToExport: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator; // Para la paginación, y los '!' indican que no será nulo
  @ViewChild(MatSort) sort!: MatSort; // Para el ordenamiento
  @ViewChild('viewNovedadDialog') viewNovedadDialog!: TemplateRef<any>; // Referencia al cuadro emergente de vista de usuario

  ngOnInit(): void {
    this.loading = true;

    // Realizar múltiples llamadas a servicios y combinar resultados con forkJoin
    const forkJoinSub = forkJoin([
      this.api.getAllRastreos(),
      this.api.getEstadoRastreo(),
      this.apiPaquete.getAllPaquetes()
    ]).subscribe(([novedad, estado, paquete]) => {
      // Filtrar novedades por estado y actualizar datos en la tabla
      this.novedades = novedad.filter(item => item.idEstado == 2);
      this.dataSource.data = this.novedades;

      // Mostrar mensaje si no hay novedades
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

      // Asignar datos de estados y paquetes
      this.estados = estado;
      this.paquetes = paquete;

      // Finalizar carga
      this.loading = false;
    },
    error => {
      // Mostrar mensaje en caso de error
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

    // Agregar la suscripción al arreglo de suscripciones
    this.subscriptions.add(forkJoinSub);
  }

  // Configurar paginación y ordenamiento después de que la vista se haya inicializado
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Cancelar suscripciones al destruir el componente
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Abrir diálogo para ver detalles de una novedad
  viewNovedad(novedad: RastreoInterface): void {
    this.dialog.open(this.viewNovedadDialog, {
      data: novedad,
      width: '400px',
    });
  }

  // Obtener detalles de un paquete por su ID
  getPaquete(idPaquete: any): any {
    const paquete = this.paquetes.find(tipo => tipo.idPaquete === idPaquete);
    return paquete || '';
  }

  // Obtener el nombre de un estado por su ID
  getEstado(idEstado: any): string {
    const estado = this.estados.find(tipo => tipo.idEstado === idEstado);
    return estado?.nombreEstado || '';
  }

  // Aplicar filtro a los datos de la tabla
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    if (filterValue === '') {
      // Restaurar todos los datos si el filtro está vacío
      this.dataSource.data = this.novedades;
    } else {
      // Aplicar filtro a los datos por código de paquete, fecha y estado
      this.dataSource.data = this.novedades.filter(novedad =>
        this.getPaquete(novedad.idPaquete).codigoPaquete.toLowerCase().includes(filterValue) ||
        novedad.fechaNoEntrega.toLowerCase().includes(filterValue) ||
        this.getEstado(novedad.idEstado).toLowerCase().includes(filterValue)
      );
    }
  }
}
