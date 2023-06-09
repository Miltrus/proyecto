import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NovedadService } from '../../../services/api/novedad/novedad.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { NovedadInterface } from 'src/app/models/novedad.interface';
import { TipoNovedadInterface } from 'src/app/models/tipo-novedad.interface';
import { EntregaInterface } from 'src/app/models/entrega.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent, ConfirmDialogData } from '../../../components/dialog-confirm/dialog-confirm.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LoginComponent } from 'src/app/components/login/login.component';


@Component({
  selector: 'app-list-novedades',
  templateUrl: './list-novedades.component.html',
  styleUrls: ['./list-novedades.component.scss']
})
export class ListNovedadesComponent implements OnInit {

  constructor(
    private api: NovedadService,
    private router: Router,
    private alerts: AlertsService,
    private dialog: MatDialog,
    private auth: LoginComponent
  ) { }

  novedades: NovedadInterface[] = [];
  tiposNovedad: TipoNovedadInterface[] = [];
  entrega: EntregaInterface[] = [];
  dataSource = new MatTableDataSource(this.novedades); //pal filtro

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento
  @ViewChild('viewNovedadDialog') viewNovedadDialog!: TemplateRef<any>; // Referencia al cuadro emergente de vista de usuario

  ngOnInit(): void {
    this.auth.checkLocalStorage();
    this.api.getAllNovedades().subscribe(data => {
      this.novedades = data;
      this.dataSource.data = this.novedades; //actualizamos el datasource ya que inicialmente contiene el arreglo vacio de clientes
    });

    this.api.getTipoNovedad().subscribe(data => {
      this.tiposNovedad = data;
      
    });

    this.api.getEntrega().subscribe(data => {
      this.entrega = data;
    });
  }

  ngAfterViewInit() { //para la paginacion
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  viewNovedad(novedad: NovedadInterface): void {
    this.dialog.open(this.viewNovedadDialog, {
      data: novedad,
      width: '400px', // Ajusta el ancho del cuadro emergente según tus necesidades
    });
  }

  getTipoNovedad(idTipoNovedad: any): string {
    const tiposNovedad = this.tiposNovedad.find(tipo => tipo.idTipoNovedad === idTipoNovedad);
    return tiposNovedad?.tipoNovedad || '';
  }

  getEntrega(idEntrega: any): string {
    const entrega = this.entrega.find(estado => estado.idEntrega === idEntrega);
    return entrega?.idEntrega || '';
  }

  goBack() {
    this.router.navigate(['dashboard']);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}