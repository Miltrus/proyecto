import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ClienteInterface } from '../../../models/cliente.interface';
import { EstadoPaqueteInterface } from '../../../models/estado-paquete.interface';
import { UsuarioInterface } from '../../../models/usuario.interface';
import { PaqueteInterface } from '../../../models/paquete.interface';
import { PaqueteService } from '../../../services/api/paquete/paquete.service';
import { TamanoPaqueteInterface } from 'src/app/models/tamano-paquete.interface';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from '../../../models/response.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';


@Component({
  selector: 'app-edit-paquete',
  templateUrl: './edit-paquete.component.html',
  styleUrls: ['./edit-paquete.component.scss']
})
export class EditPaqueteComponent implements OnInit {

  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private api: PaqueteService,
    private alerts: AlertsService,
    private dialog: MatDialog,
  ) { }

  editForm = new FormGroup({
    idPaquete: new FormControl(''),
    codigoQrPaquete: new FormControl('', Validators.required),
    pesoPaquete: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]),
    unidadesPaquete: new FormControl('',[ Validators.required, Validators.pattern('^[0-9]+$')]),
    contenidoPaquete: new FormControl('', Validators.required),
    documentoDestinatario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]),
    nombreDestinatario: new FormControl('', Validators.required),
    correoDestinatario: new FormControl('', [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    telefonoDestinatario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
    fechaAproxEntrega: new FormControl('', Validators.required),
    documentoRemitente: new FormControl('', Validators.required),
    idTamano: new FormControl('', Validators.required),
    idEstado: new FormControl('1'),
  })

  dataPaquete: PaqueteInterface[] = [];
  usuario: UsuarioInterface[] = [];
  remitente: ClienteInterface[] = [];
  destinatario: ClienteInterface[] = [];
  estadosPaquete: EstadoPaqueteInterface[] = [];
  tamanos: TamanoPaqueteInterface[] = [];
  loading: boolean = true;
  hideCodigoQrPaquete: boolean = true;

  selectedRemitente: ClienteInterface | undefined;
  selectedDestinatario: ClienteInterface | undefined = undefined;

  ngOnInit(): void {
    let idPaquete = this.activatedRouter.snapshot.paramMap.get('id');
    this.updateCodigoQr();
    this.api.getOnePaquete(idPaquete).subscribe(data => {
      this.dataPaquete = data ? [data] : []; //si data encontró algun valor, lo asignamos a dataRol envuelto en un arreglo, si data es null asignamos un arreglo vacio, si no se hace esto da error
      this.editForm.setValue({
        'idPaquete': this.dataPaquete[0]?.idPaquete || 'idPaquete',
        'codigoQrPaquete': this.dataPaquete[0]?.codigoQrPaquete || '', //si dataRol[0] es null, asignamos un string vacio, si no se hace esto da error
        'pesoPaquete': this.dataPaquete[0]?.pesoPaquete || '',
        'unidadesPaquete': this.dataPaquete[0]?.unidadesPaquete || '',
        'contenidoPaquete': this.dataPaquete[0]?.contenidoPaquete || '',
        'documentoDestinatario': this.dataPaquete[0]?.documentoDestinatario || 'documentoDestinatario',
        'nombreDestinatario': this.dataPaquete[0]?.nombreDestinatario || '',
        'correoDestinatario': this.dataPaquete[0]?.correoDestinatario || '',
        'telefonoDestinatario': this.dataPaquete[0]?.telefonoDestinatario || '',
        'fechaAproxEntrega': this.dataPaquete[0]?.fechaAproxEntrega || '',
        'documentoRemitente': this.dataPaquete[0]?.documentoRemitente || '',
        'idTamano': this.dataPaquete[0]?.idTamano || 'idTamano',
        'idEstado': this.dataPaquete[0]?.idEstado || 'idEstado',
      });

      this.loading = false;
    });
    this.getUsuarioPaquete();
    this.getRemitenteAndDestinatarioPaquete();
    this.getEstadoPaquete();
    this.getTamanoPaquete(); //:v
  }

  postForm(id: any) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Está seguro que deseas modificar este paquete?',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.api.putPaquete(id).subscribe(data => {
          let respuesta: ResponseInterface = data;
          if (respuesta.status == 'ok') {
            this.alerts.showSuccess('El paquete ha sido modificado', 'Modificación exitosa');
            this.router.navigate(['paquete/list-paquetes']);
          }
          else {
            this.alerts.showError(respuesta.msj, "Error en la modificación");
            this.loading = false;
          }
        });
      } else {
        this.alerts.showInfo('No se ha modificado el paquete', 'Modificación cancelada');
      }
    });
  }

  getUsuarioPaquete(): void {
    this.api.getUsuario().subscribe(data => {
      this.usuario = data;
      this.loading = false;
    });
  }

  getRemitenteAndDestinatarioPaquete(): void {
    this.api.getRemitenteAndDestinatario().subscribe(data => {
      this.remitente = data;
      // Obtén el remitente seleccionado al cargar la página
      const remitenteSeleccionado = this.editForm.get('documentoRemitente')?.value;
      // Busca el remitente seleccionado en la lista de remitentes
      this.selectedRemitente = this.remitente.find(remi => remi.documentoCliente === remitenteSeleccionado);

      this.destinatario = data;
      // Obtén el remitente seleccionado al cargar la página
      const destinatarioSeleccionado = this.editForm.get('documentoDestinatario')?.value;
      // Busca el remitente seleccionado en la lista de remitentes
      this.selectedDestinatario = this.destinatario.find(dest => dest.documentoCliente === destinatarioSeleccionado);
      this.loading = false;
    });
  }

  updateCodigoQr(): void {
    const direccionDestinatario = this.selectedDestinatario?.direccionCliente || '';
    this.editForm.patchValue({ codigoQrPaquete: direccionDestinatario });
  }

  getEstadoPaquete(): void {
    this.api.getEstadoPaquete().subscribe(data => {
      this.estadosPaquete = data;
      this.loading = false;
    });
  }

  getTamanoPaquete(): void {
    this.api.getTamanoPaquete().subscribe(data => {
      this.tamanos = data;
      this.loading = false;
    });
  }

  onRemitenteSelectionChange(event: any) {
    const documentoCliente = event.value;
    this.selectedRemitente = this.remitente.find(remi => remi.documentoCliente === documentoCliente);
  }

  onDestinatarioSelectionChange(event: any) {
    const documentoCliente = event.value;
    this.selectedDestinatario = this.destinatario.find(desti => desti.documentoCliente === documentoCliente);

    if (this.selectedDestinatario) {
      const direccionDestinatario = this.selectedDestinatario.direccionCliente || '';
      this.editForm.patchValue({ codigoQrPaquete: direccionDestinatario });
    } else {
      this.editForm.patchValue({ codigoQrPaquete: '' });
    }
  }
  mostrarCodigoQrPaquete() {
    this.hideCodigoQrPaquete = false;
  }

  goBack() {
    this.loading = true;
    this.router.navigate(['paquete/list-paquetes']);
  }
}
