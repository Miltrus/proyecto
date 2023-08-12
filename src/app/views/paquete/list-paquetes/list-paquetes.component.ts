import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PaqueteService } from '../../../services/api/paquete.service';
import { Router } from '@angular/router';
import { PaqueteInterface } from 'src/app/models/paquete.interface';
import { UsuarioInterface } from 'src/app/models/usuario.interface';
import { ClienteInterface } from 'src/app/models/cliente.interface';
import { EstadoPaqueteInterface } from 'src/app/models/estado-paquete.interface';
import { TamanoPaqueteInterface } from 'src/app/models/tamano-paquete.interface';
import { MatDialog } from '@angular/material/dialog';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import * as QRCode from 'qrcode';
import { DomSanitizer } from '@angular/platform-browser';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { TipoPaqueteInterface } from 'src/app/models/tipo-paquete.interface';
import Swal from 'sweetalert2';

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
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) { }

  paquetes: PaqueteInterface[] = [];
  usuario: UsuarioInterface[] = [];
  remitente: ClienteInterface[] = [];
  destinatario: ClienteInterface[] = [];
  estadosPaquete: EstadoPaqueteInterface[] = [];
  tamano: TamanoPaqueteInterface[] = [];
  tipos: TipoPaqueteInterface[] = [];
  dataSource = new MatTableDataSource(this.paquetes); //pal filtro
  loading: boolean = true;
  cords: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento
  @ViewChild('viewPaqueteDialog') viewPaqueteDialog!: TemplateRef<any>; // Referencia al cuadro emergente de vista de usuario


  ngOnInit(): void {
    this.api.getAllPaquetes().subscribe(async data => {
      if (Array.isArray(data)) {

        this.paquetes = data;
        this.dataSource.data = this.paquetes;
        this.paquetes.forEach(async (paquete) => {
          const qrData = [{ 'cod': paquete.codigoPaquete, 'lat': paquete.lat, 'lng': paquete.lng }]
          const qrCodeBase64 = await this.generateQRCode(qrData);
          paquete.qrCodeUrl = this.sanitizer.bypassSecurityTrustUrl(qrCodeBase64);
        });
      }

      this.loading = false;
    });

    this.api.getUsuario().subscribe(data => {
      this.usuario = data;
      this.loading = false;
    });

    this.api.getRemitenteAndDestinatario().subscribe(data => {
      this.destinatario = data;
      this.remitente = data;
      this.loading = false;
    });

    this.api.getEstadoPaquete().subscribe(data => {
      this.estadosPaquete = data;
      this.loading = false;
    });

    this.api.getTamanoPaquete().subscribe(data => {
      this.tamano = data;
      this.loading = false;
    });

    this.api.getTipoPaquete().subscribe(data => {
      this.tipos = data;
      this.loading = false;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  viewPaquete(usuario: PaqueteInterface): void {
    this.dialog.open(this.viewPaqueteDialog, {
      data: usuario,
      width: '400px',
    });
  }

  async generateQRCode(data: any): Promise<string> {
    try {
      const jsonStr = JSON.stringify(data);
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, jsonStr);
      const qrCodeBase64 = canvas.toDataURL('image/png');
      return qrCodeBase64;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
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
    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro de que deseas eliminar este paquete?',
      showDenyButton: true,
      showCancelButton: true,
      showConfirmButton: false,
      reverseButtons: true,
      denyButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isDenied) {
        this.loading = true;
        this.api.deletePaquete(id).subscribe(data => {
          if (data.status == 'ok') {
            this.paquetes = this.paquetes.filter(paquete => paquete.idPaquete !== id);
            this.dataSource.data = this.paquetes; //actualizamos el datasource
            Swal.fire({
              icon: 'success',
              title: 'Paquete eliminado',
              text: 'El paquete ha sido eliminado exitosamente.',
              toast: true,
              showConfirmButton: false,
              timer: 5000,
              position: 'top-end',
              timerProgressBar: true,
              showCloseButton: true,
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error en la eliminación',
              text: data.msj,
            });
          }
          this.loading = false;
        });
      }
    });
  }


  getUsuarioPaquete(documentoUsuario: any): { nombre: string, apellido: string } {
    const mensajero = this.usuario.find(documentoU => documentoU.documentoUsuario === documentoUsuario);
    if (mensajero && mensajero.nombreUsuario && mensajero.apellidoUsuario) {
      return { nombre: mensajero.nombreUsuario, apellido: mensajero.apellidoUsuario };
    }
    return { nombre: '', apellido: '' };
  }

  getRemitentePaquete(documentoRemitente: any): { nombre: string, telefono: string, correo: string } {
    const remitente = this.remitente.find(documentoR => documentoR.documentoCliente === documentoRemitente);
    if (remitente && remitente.nombreCliente && remitente.telefonoCliente && remitente.correoCliente) {
      return { nombre: remitente.nombreCliente, telefono: remitente.telefonoCliente, correo: remitente.correoCliente };
    }
    return { nombre: '', telefono: '', correo: '' };
  }


  getDestinatarioPaquete(documentoDestinatario: any,): { nombre: string, telefono: string, correo: string, direccion: string, detalleDireccion: string } {
    const destinatario = this.destinatario.find(documentoD => documentoD.documentoCliente === documentoDestinatario);
    if (destinatario && destinatario.nombreCliente && destinatario.telefonoCliente && destinatario.correoCliente && destinatario.direccionCliente && destinatario.detalleDireccionCliente) {
      return { nombre: destinatario.nombreCliente, telefono: destinatario.telefonoCliente, correo: destinatario.correoCliente, direccion: destinatario.direccionCliente, detalleDireccion: destinatario.detalleDireccionCliente };
    }
    return { nombre: '', telefono: '', correo: '', direccion: '', detalleDireccion: '' };
  }

  getEstadoPaquete(idEstado: any): string {
    const estadoPaquete = this.estadosPaquete.find(estado => estado.idEstado === idEstado);
    return estadoPaquete?.estadoPaquete || '';
  }

  getTamanoPaquete(idTamano: any): string {
    const tamanoPaquete = this.tamano.find(tam => tam.idTamano === idTamano);
    return tamanoPaquete?.tamanoPaquete || '';
  }

  getTipoPaquete(idTipo: any): string {
    const tipoPaquete = this.tipos.find(tip => tip.idTipo === idTipo);
    return tipoPaquete?.tipoPaquete || '';
  }

  async generatePDF(idPaquete: string): Promise<void> {
    const paquete = this.paquetes.find((paquete) => paquete.idPaquete === idPaquete);
    console.log(paquete?.qrCodeUrl?.toString())

    if (paquete && paquete.qrCodeUrl) {
      try {
        const qrCodeDataUrl = paquete.qrCodeUrl.toString();

        // Generate all QR codes first
        const qrCodePromises = this.paquetes.map(async (p) => {
          if (p.idPaquete !== undefined && p.lat !== undefined && p.lng !== undefined) {
            const qrData = [{ 'cod': p.codigoPaquete, 'lat': p.lat, 'lng': p.lng }];
            p.qrCodeUrl = await this.generateQRCode(qrData);
          }
        });
        await Promise.all(qrCodePromises);
        const docDefinition: TDocumentDefinitions = {
          content: [
            { text: 'Registro de paquete', style: 'header' },
            {
              style: 'tableExample',
              table: {
                widths: ['50%', '50%'],
                heights: (index) => (index === 9 ? 150 : 30),
                body: [
                  ['Código paquete', paquete.codigoPaquete],
                  ['Remitente', this.getRemitentePaquete(paquete.documentoRemitente).nombre],
                  ['Destinatario', paquete.nombreDestinatario],
                  ['Teléfono destinatario', paquete.telefonoDestinatario],
                  ['Correo destinatario', paquete.correoDestinatario],
                  ['Dirección destinatario', paquete.direccionPaquete],
                  ['Detalle dirección', paquete.detalleDireccionPaquete],
                  ['Peso paquete', paquete.pesoPaquete + ' kg'],
                  ['Contenido paquete', paquete.contenidoPaquete],
                  [
                    { text: 'Código QR', style: 'subheader' },
                    { image: paquete.qrCodeUrl.toString(), width: 100, height: 100, alignment: 'center' }
                  ]
                ] as any[][]
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
            subheader: {
              fontSize: 14,
              margin: [0, 10, 0, 5]
            },
            tableExample: {
              margin: [0, 5, 0, 15]
            }
          },
          pageOrientation: 'landscape',
          pageBreakBefore: (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) => {
            return currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0 && currentNode.startPosition.top >= 750;
          }
        };

        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        pdfDocGenerator.getBlob((blob: Blob) => {
          const pdfBlobUrl = URL.createObjectURL(blob);
          window.open(pdfBlobUrl, '_blank');
        });
      } catch (error) {
        console.log('Error creando el pdf', error);
      }
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