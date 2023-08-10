import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { NovedadService } from '../../../services/api/novedad.service';
import { Router } from '@angular/router';
import { NovedadInterface } from 'src/app/models/novedad.interface';
import { TipoNovedadInterface } from 'src/app/models/tipo-novedad.interface';
import { EntregaInterface } from 'src/app/models/entrega.interface';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription, forkJoin } from 'rxjs';
import { AlertsService } from 'src/app/services/alerts/alerts.service';


@Component({
  selector: 'app-list-novedades',
  templateUrl: './list-novedades.component.html',
  styleUrls: ['./list-novedades.component.scss']
})
export class ListNovedadesComponent implements OnInit, OnDestroy {

  constructor(
    private api: NovedadService,
    private router: Router,
    private dialog: MatDialog,
    private alerts: AlertsService
  ) { }

  private subscriptions: Subscription = new Subscription();

  novedades: NovedadInterface[] = [];
  tiposNovedad: TipoNovedadInterface[] = [];
  entrega: EntregaInterface[] = [];
  dataSource = new MatTableDataSource(this.novedades); //pal filtro
  loading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento
  @ViewChild('viewNovedadDialog') viewNovedadDialog!: TemplateRef<any>; // Referencia al cuadro emergente de vista de usuario

  ngOnInit(): void {
    this.loading = true;

    const forkJoinSub = forkJoin([
      this.api.getAllNovedades(),
      this.api.getTipoNovedad(),
      this.api.getEntrega()
    ]).subscribe(([novedades, tiposNovedad, entrega]) => {
      this.novedades = novedades;
      this.dataSource.data = this.novedades;
      if (this.dataSource.data.length < 1) {
        this.alerts.showInfo('No se encontraron novedades en el sistema.', 'No hay novedades registradas');
      }
      this.tiposNovedad = tiposNovedad;
      this.entrega = entrega;
      this.loading = false;
    });
    this.subscriptions.add(forkJoinSub);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this.subscriptions.unsubscribe();
  }

  getTipoNovedad(idTipoNovedad: any): string {
    const tiposNovedad = this.tiposNovedad.find(tipo => tipo.idTipoNovedad === idTipoNovedad);
    return tiposNovedad?.tipoNovedad || '';
  }

  getEntrega(idEntrega: any): string {
    const entrega = this.entrega.find(estado => estado.idEntrega === idEntrega);
    return entrega?.idEntrega || '';
  }

  viewNovedad(novedad: NovedadInterface): void {
    this.dialog.open(this.viewNovedadDialog, {
      data: novedad,
      width: '400px',
    });
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