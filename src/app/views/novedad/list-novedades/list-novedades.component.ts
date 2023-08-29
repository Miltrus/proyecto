// Importaciones de módulos y clases necesarias
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RastreoInterface } from 'src/app/models/rastreo.interface';
import { RastreoService } from 'src/app/services/api/rastreo.service';
import { EstadoRastreoInterface } from 'src/app/models/estado-rastreo.interface';
import { Subscription, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { PaqueteService } from 'src/app/services/api/paquete.service';
import { PaqueteInterface } from 'src/app/models/paquete.interface';
import { UsuarioInterface } from 'src/app/models/usuario.interface';

@Component({
  selector: 'app-list-novedades',
  templateUrl: './list-novedades.component.html',
  styleUrls: ['./list-novedades.component.scss']
})
export class ListNovedadesComponent implements OnInit {

  constructor(
    private api: RastreoService,
    private apiPaquete: PaqueteService,
    private dialog: MatDialog,
  ) { }

  private subscriptions: Subscription = new Subscription();

  // Arreglos para almacenar datos
  novedades: RastreoInterface[] = [];
  estados: EstadoRastreoInterface[] = [];
  paquetes: PaqueteInterface[] = [];
  usuario: UsuarioInterface[] = [];

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
      this.api.getRastreosByNovedad(),
      this.api.getEstadoRastreo(),
      this.apiPaquete.getAllPaquetes()
    ]).subscribe(([novedad, estado, paquete]) => {
      // Filtrar novedades por estado y actualizar datos en la tabla
      this.novedades = novedad.filter(item => item.idEstado == 2);
      this.dataSource.data = this.novedades;

      console.log(this.dataSource.data)

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
      console.log(this.paquetes)
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

  getUsuarioPaquete(idUsuario: any): any {
    const paquete = this.paquetes.find(msj => msj.idUsuario === idUsuario);

    return paquete || '';
  }

  getMensajero(idUsuario: any): { nombre: string, apellido: string } {
    const mensajero = this.usuario.find(documentoU => documentoU.idUsuario == idUsuario);
    console.log('Mensajero:', mensajero); // Agregar este console.log
    if (mensajero && mensajero.nombreUsuario && mensajero.apellidoUsuario) {
      return { nombre: mensajero.nombreUsuario, apellido: mensajero.apellidoUsuario };
    }
    return { nombre: '', apellido: '' };
  }


  getEstado(idEstado: any): string {
    const estado = this.estados.find(tipo => tipo.idEstado === idEstado);
    return estado?.nombreEstado || '';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    if (filterValue === '') {
      this.dataSource.data = this.novedades;
    } else {
      this.dataSource.data = this.novedades.filter(novedad =>
        this.getPaquete(novedad.idPaquete).codigoPaquete.toLowerCase().includes(filterValue) ||
        novedad.fechaNoEntrega.toLowerCase().includes(filterValue) ||
        this.getEstado(novedad.idEstado).toLowerCase().includes(filterValue)
      );
    }
  }
}
