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
    documentoRemitente: new FormControl('', Validators.required),
    codigoQrPaquete: new FormControl(''),
    documentoDestinatario: new FormControl('', Validators.required),
    pesoPaquete: new FormControl('', Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')),
    idTamano: new FormControl('', Validators.required),
    idEstado: new FormControl('', Validators.required),
  })

  dataPaquete: PaqueteInterface[] = [];
  usuario: UsuarioInterface[] = [];
  remitente: ClienteInterface[] = [];
  destinatario: ClienteInterface[] = [];
  estadosPaquete: EstadoPaqueteInterface[] = [];
  tamanos: TamanoPaqueteInterface[] = [];
  loading: boolean = true;

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
        'documentoRemitente': this.dataPaquete[0]?.documentoRemitente || 'documentoRemitente',
        'documentoDestinatario': this.dataPaquete[0]?.documentoDestinatario || 'documentoDestinatario',
        'pesoPaquete': this.dataPaquete[0]?.pesoPaquete || '',
        'idTamano': this.dataPaquete[0]?.idTamano || 'idTamano',
        'idEstado': this.dataPaquete[0]?.idEstado || 'idEstado',
      });

      this.loading = false;
    });
    this.getUsuarioPaquete();
    this.getRemitentePaquete();
    this.getDestinatarioPaquete();
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

  getRemitentePaquete(): void {
    this.api.getRemitente().subscribe(data => {
      this.remitente = data;
      // Obtén el remitente seleccionado al cargar la página
      const remitenteSeleccionado = this.editForm.get('documentoRemitente')?.value;
      // Busca el remitente seleccionado en la lista de remitentes
      this.selectedRemitente = this.remitente.find(remi => remi.documentoCliente === remitenteSeleccionado);
      this.loading = false;
    });
  }

  updateCodigoQr(): void {
    const direccionDestinatario = this.selectedDestinatario?.direccionCliente || '';
    this.editForm.patchValue({ codigoQrPaquete: direccionDestinatario });
  }

  getDestinatarioPaquete(): void {
    this.api.getDestinatario().subscribe(data => {
      this.destinatario = data;
      // Obtén el remitente seleccionado al cargar la página
      const destinatarioSeleccionado = this.editForm.get('documentoDestinatario')?.value;
      // Busca el remitente seleccionado en la lista de remitentes
      this.selectedDestinatario = this.destinatario.find(dest => dest.documentoCliente === destinatarioSeleccionado);
      this.loading = false;
    });
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

  goBack() {
    this.loading = true;
    this.router.navigate(['paquete/list-paquetes']);
  }
}
