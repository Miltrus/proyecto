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
import { UsuarioInterface } from 'src/app/models/usuario.interface';
import { UsuarioService } from 'src/app/services/api/usuario.service';
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
    private apiUsuario: UsuarioService,
    private dialog: MatDialog,
  ) { }

  private subscriptions: Subscription = new Subscription();

  entregas: any[] = [];
  rastreos: RastreoInterface[] = [];
  paquetes: PaqueteInterface[] = [];
  usuarios: UsuarioInterface[] = [];
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
      this.apiPaquete.getAllPaquetes(),
      this.apiUsuario.getAllUsuarios()
    ]).subscribe(([entrega, rastreo, paquete, usuario]) => {
      this.entregas = entrega;
      this.usuarios = usuario;
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

  getEntrega(idEntrega: any): any {
    const entrega = this.entregas.find(tipo => tipo.idEntrega === idEntrega);
    return entrega || '';
  }

  getRastreo(idRastreo: any): any {
    const rastreo = this.rastreos.find(tipo => tipo.idRastreo === idRastreo);
    return this.getPaquete(rastreo?.idPaquete);
  }

  getPaquete(idPaquete: any): any {
    const paquete = this.paquetes.find(tipo => tipo.idPaquete === idPaquete);
    return paquete || '';
  }


  getMensajero(idEntrega: any): any {
    const entrega = this.getEntrega(idEntrega);

    if (entrega.idRastreo) {
      const novedad = this.rastreos.find(idR => idR.idRastreo == entrega.idRastreo);

      if (novedad?.idPaquete) {
        const paquete = this.paquetes.find(idP => idP.idPaquete == novedad.idPaquete);

        if (paquete?.idUsuario) {
          const mensajero = this.usuarios.find(documentoU => documentoU.idUsuario == paquete.idUsuario);

          if (mensajero && mensajero.nombreUsuario && mensajero.apellidoUsuario) {
            return mensajero || '';
          }
        }
      }
      return 'No hay mensajero';
    }
  }

  generateExcel(): void {
    const dataToExport = this.entregas.map(entrega => ({
      'Nombre destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).idPaquete).nombreDestinatario,
      'Documento destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).idPaquete).documentoDestinatario,
      'Dirección destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).idPaquete).direccionPaquete,
      'Telefono destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).idPaquete).telefonoDestinatario,
      'Codigo paquete': this.getPaquete(this.getRastreo(entrega.idRastreo).idPaquete).codigoPaquete,
      'Peso paquete': this.getPaquete(this.getRastreo(entrega.idRastreo).idPaquete).pesoPaquete,
      'Contenido paquete': this.getPaquete(this.getRastreo(entrega.idRastreo).idPaquete).contenidoPaquete,
      'Fecha de entrega': entrega.fechaEntrega,
      'Mensajero': this.getMensajero(entrega.idEntrega).nombreUsuario + ' ' + this.getMensajero(entrega.idEntrega).apellidoUsuario,
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Entregas');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const excelFileURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = excelFileURL;
    link.download = 'entregas.xlsx';
    link.click();
  }

  generatePDF(): void {
    this.dataToExport = this.entregas.map(entrega => ({
      'Nombre destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).idPaquete).nombreDestinatario,
      'Documento destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).idPaquete).documentoDestinatario,
      'Dirección destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).idPaquete).direccionPaquete,
      'Telefono destinatario': this.getPaquete(this.getRastreo(entrega.idRastreo).idPaquete).telefonoDestinatario,
      'Codigo paquete': this.getPaquete(this.getRastreo(entrega.idRastreo).idPaquete).codigoPaquete,
      'Peso paquete': this.getPaquete(this.getRastreo(entrega.idRastreo).idPaquete).pesoPaquete,
      'Contenido paquete': this.getPaquete(this.getRastreo(entrega.idRastreo).idPaquete).contenidoPaquete,
      'Fecha de entrega': entrega.fechaEntrega,
      'Mensajero': this.getMensajero(entrega.idEntrega).nombreUsuario + ' ' + this.getMensajero(entrega.idEntrega).apellidoUsuario,
    }));

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Lista de Entregas', style: 'header' },
        {
          style: 'tableExample',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              ['Nombre destinatario', 'Documento destinatario', 'Dirección destinatario', 'Telefono destinatario', 'Codigo paquete', 'Peso paquete', 'Contenido paquete', 'Fecha de entrega', 'Mensajero'],
              ...this.dataToExport.map(entrega => [
                entrega['Nombre destinatario'],
                entrega['Documento destinatario'],
                entrega['Dirección destinatario'],
                entrega['Telefono destinatario'],
                entrega['Codigo paquete'],
                entrega['Peso paquete'],
                entrega['Contenido paquete'],
                entrega['Fecha de entrega'],
                entrega['Mensajero'],
              ])
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        tableExample: {
          margin: [0, 5, 0, 15]
        }
      },
      pageOrientation: 'landscape'
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBlob((blob: Blob) => {
      const pdfBlobUrl = URL.createObjectURL(blob);
      window.open(pdfBlobUrl, '_blank');
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
