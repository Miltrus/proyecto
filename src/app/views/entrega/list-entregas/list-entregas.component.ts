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

import * as XLSX from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

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
      this.apiPaquete.getAllPaquetes()
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
          icon: 'error',
          title: 'Error en el servidor',
          text: 'Ha ocurrido un error al comunicarse con el servidor. Por favor, revisa tu conexión a internet o inténtalo nuevamente.',
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

  generateExcel(): void {
    const dataToExport = this.entregas.map(entrega => ({
      'Codigo': entrega.idEntrega,
      'Fecha de entrega': entrega.fechaEntrega,
      'Nombre del destinatario': entrega.nombreDestinatario,
      'Documento del destinatario': entrega.cedulaDestinatario,
      'Direccion': entrega.direccion,
      'Telefono': entrega.telefono,
      'Codigo paquete': this.getRastreo(entrega.idRastreo).codigo,
      'Peso': this.getPaquete(this.getRastreo(entrega.idRastreo).idPaquete).peso,
      'Contenido': this.getPaquete(this.getRastreo(entrega.idRastreo).idPaquete).contenido,
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Novedades');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const excelFileURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = excelFileURL;
    link.download = 'clientes.xlsx';
    link.click();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
