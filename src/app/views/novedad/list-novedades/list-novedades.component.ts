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
import { UsuarioService } from 'src/app/services/api/usuario.service';

import * as XLSX from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-list-novedades',
  templateUrl: './list-novedades.component.html',
  styleUrls: ['./list-novedades.component.scss']
})
export class ListNovedadesComponent implements OnInit {

  constructor(
    private api: RastreoService,
    private apiPaquete: PaqueteService,
    private apiUsuario: UsuarioService,
    private dialog: MatDialog,
  ) { }

  private subscriptions: Subscription = new Subscription();

  novedades: RastreoInterface[] = [];
  estados: EstadoRastreoInterface[] = [];
  paquetes: PaqueteInterface[] = [];
  usuarios: UsuarioInterface[] = [];

  dataSource = new MatTableDataSource(this.novedades); // Para el filtro
  loading: boolean = true;
  dataToExport: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; // Para el ordenamiento
  @ViewChild('viewNovedadDialog') viewNovedadDialog!: TemplateRef<any>; // Referencia al cuadro emergente de vista de usuario

  ngOnInit(): void {
    this.loading = true;

    const forkJoinSub = forkJoin([
      this.api.getRastreosByNovedad(),
      this.api.getEstadoRastreo(),
      this.apiPaquete.getAllPaquetes(),
      this.apiUsuario.getAllUsuarios()
    ]).subscribe(([novedad, estado, paquete, usuario]) => {
      // Filtrar novedades por estado y actualizar datos en la tabla
      this.novedades = novedad.filter(item => item.idEstado == 2);
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
      this.usuarios = usuario;

      this.loading = false;
    },
      error => {
        console.log(error);
        Swal.fire({
          title: 'Error en el servidor',
          text: 'Ha ocurrido un error al comunicarse con el servidor. Por favor, revisa tu conexión a internet o inténtalo nuevamente.',
          icon: 'error',
        })
      });

    this.subscriptions.add(forkJoinSub);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Cancelar suscripciones al destruir el componente
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

  getMensajero(idPaquete: any): any {
    const paquete = this.getPaquete(idPaquete);

    if (paquete.idUsuario) {
      const mensajero = this.usuarios.find(documentoU => documentoU.idUsuario == paquete.idUsuario);
      if (mensajero && mensajero.nombreUsuario && mensajero.apellidoUsuario) {
        return mensajero || '';
      }
    }
    return '';
  }


  getEstado(idEstado: any): string {
    const estado = this.estados.find(tipo => tipo.idEstado === idEstado);
    return estado?.nombreEstado || '';
  }

  generateExcel(): void {
    const dataToExport = this.novedades.map(novedad => ({
      'Código paquete': this.getPaquete(novedad.idPaquete).codigoPaquete,
      'Fecha': novedad.fechaNoEntrega,
      'Motivo': novedad.motivoNoEntrega,
      'Mensajero': this.getMensajero(novedad.idPaquete).nombreUsuario + ' ' + this.getMensajero(novedad.idPaquete).apellidoUsuario,
      'Doc Mensajero': this.getMensajero(novedad.idPaquete).documentoUsuario,
      'Doc Destinatario': this.getPaquete(novedad.idPaquete).documentoDestinatario,
      'Nombre Destinatario': this.getPaquete(novedad.idPaquete).nombreDestinatario,
      'Telefono Destinatario': this.getPaquete(novedad.idPaquete).telefonoDestinatario,
      'Correo Destinatario': this.getPaquete(novedad.idPaquete).correoDestinatario,
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Novedades');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const excelFileURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = excelFileURL;
    link.download = 'novedades.xlsx';
    link.click();
  }

  generatePDF(): void {
    this.dataToExport = this.novedades.map(novedad => ({
      'Código paquete': this.getPaquete(novedad.idPaquete).codigoPaquete,
      'Fecha': novedad.fechaNoEntrega,
      'Motivo': novedad.motivoNoEntrega,
      'Mensajero': this.getMensajero(novedad.idPaquete).nombreUsuario + ' ' + this.getMensajero(novedad.idPaquete).apellidoUsuario,
      'Doc Mensajero': this.getMensajero(novedad.idPaquete).documentoUsuario,
      'Doc Destinatario': this.getPaquete(novedad.idPaquete).documentoDestinatario,
      'Nombre Destinatario': this.getPaquete(novedad.idPaquete).nombreDestinatario,
      'Telefono Destinatario': this.getPaquete(novedad.idPaquete).telefonoDestinatario,
      'Correo Destinatario': this.getPaquete(novedad.idPaquete).correoDestinatario,
    }));

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Lista de Novedades', style: 'header' },
        {
          style: 'tableExample',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              ['Codigo paquete', 'Fecha', 'Motivo', 'Mensajero', 'Doc Mensajero', 'Doc Destinatario', 'Nombre Destinatario', 'Telefono Destinatario', 'Correo Destinatario'],
              ...this.dataToExport.map(novedad => [
                novedad['Código paquete'],
                novedad['Fecha'],
                novedad['Motivo'],
                novedad['Mensajero'],
                novedad['Doc Mensajero'],
                novedad['Doc Destinatario'],
                novedad['Nombre Destinatario'],
                novedad['Telefono Destinatario'],
                novedad['Correo Destinatario'],
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
