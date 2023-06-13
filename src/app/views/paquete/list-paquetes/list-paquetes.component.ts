import { Component, OnInit, ViewChild } from '@angular/core';
import { PaqueteService } from '../../../services/api/paquete/paquete.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { PaqueteInterface } from 'src/app/models/paquete.interface';
import { UsuarioInterface } from 'src/app/models/usuario.interface';
import { ClienteInterface } from 'src/app/models/cliente.interface';
import { EstadoPaqueteInterface } from 'src/app/models/estado-paquete.interface';
import { MatDialog } from '@angular/material/dialog';

import { DialogConfirmComponent, ConfirmDialogData } from '../../../components/dialog-confirm/dialog-confirm.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import * as QRCode from 'qrcode';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { ContentImage, TDocumentDefinitions } from 'pdfmake/interfaces';

// Configurar las fuentes
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;



@Component({
  selector: 'app-list-paquetes',
  templateUrl: './list-paquetes.component.html',
  styleUrls: ['./list-paquetes.component.scss']
})
export class ListPaquetesComponent implements OnInit {

  constructor(
    private api: PaqueteService,
    private router: Router,
    private alerts: AlertsService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) { }

  paquetes: PaqueteInterface[] = [];
  usuario: UsuarioInterface[] = [];
  cliente: ClienteInterface[] = [];
  estadosPaquete: EstadoPaqueteInterface[] = [];
  dataSource = new MatTableDataSource(this.paquetes); //pal filtro
  loading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento


  ngOnInit(): void {
    this.api.getAllPaquetes().subscribe(data => {
      this.paquetes = data;
      if (this.paquetes.length < 1) {
        this.alerts.showInfo('No hay paquetes registrados', 'Sin registros');
      }
      this.dataSource.data = this.paquetes;

      this.paquetes.forEach(async (paquete) => {
        const qrCodeBase64 = await this.generateQRCode(paquete.codigoQrPaquete ?? '');
        paquete.qrCodeUrl = this.sanitizer.bypassSecurityTrustUrl(qrCodeBase64);
        paquete.qrCodeUrl = await this.generateQRCode(paquete.codigoQrPaquete ?? ''); //siu
      });
      this.loading = false;
    });

    this.api.getUsuario().subscribe(data => {
      this.usuario = data;
      this.loading = false;
    });

    this.api.getCliente().subscribe(data => {
      this.cliente = data;
      this.loading = false;
    });

    this.api.getEstadoPaquete().subscribe(data => {
      this.estadosPaquete = data;
      this.loading = false;
    });
  }

  ngAfterViewInit() { //para la paginacion
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async generateQRCode(data: string): Promise<string> {
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, data);
    const qrCodeBase64 = canvas.toDataURL('image/png');
    return qrCodeBase64;
  }

  editPaquete(id: any) {
    this.loading = true;
    this.router.navigate(['paquete/edit-paquete', id]);
  }

  newPaquete() {
    this.loading = true;
    this.router.navigate(['paquete/new-paquete']);
  }

  deletePaquete(id: any): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Estás seguro de que deseas eliminar este paquete?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.api.deletePaquete(id).subscribe(data => {
          let respuesta: ResponseInterface = data;

          if (respuesta.status == 'ok') {
            this.alerts.showSuccess('El paquete ha sido eliminado', 'Eliminación exitosa');
            this.paquetes = this.paquetes.filter(paquete => paquete.idPaquete !== id);
            this.dataSource.data = this.paquetes; //actualizamos el datasource
          } else {
            this.alerts.showError(respuesta.msj, 'Error en la eliminación');
          }
          this.loading = false;
        });
      } else {
        this.alerts.showInfo('No se ha realizado ninguna accion', 'Eliminacion cancelada');
        this.loading = false;
      }
    });
  }

  getUsuarioPaquete(documentoUsuario: any): string {
    const documento = this.usuario.find(documentoU => documentoU.documentoUsuario === documentoUsuario);
    return documento?.nombreUsuario || '';
  }


  getClientePaquete(documentoCliente: any): string {
    const cliente = this.cliente.find(documentoC => documentoC.documentoCliente === documentoCliente);
    return cliente?.nombreCliente || '';
  }

  getEstadoPaquete(idEstado: any): string {
    const estadoPaquete = this.estadosPaquete.find(estado => estado.idEstado === idEstado);
    return estadoPaquete?.estadoPaquete || '';
  }

  generatePDF(idPaquete: string): void {

    const paquete = this.paquetes.find(paquete => paquete.idPaquete === idPaquete);

    if (paquete) {
      const docDefinition = {
        content: [
          // Agrega otros elementos del PDF si es necesario
          { image: paquete.qrCodeUrl, width: 200 } as ContentImage, // Agrega la imagen del código QR con su URL

        ],
      };

      pdfMake.createPdf(docDefinition).download(`QR_${idPaquete}.pdf`);
    }
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