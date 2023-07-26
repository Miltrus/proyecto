import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ClienteInterface } from '../../../models/cliente.interface';
import { EstadoPaqueteInterface } from '../../../models/estado-paquete.interface';
import { UsuarioInterface } from '../../../models/usuario.interface';
import { PaqueteInterface } from '../../../models/paquete.interface';
import { PaqueteService } from '../../../services/api/paquete.service';
import { TamanoPaqueteInterface } from 'src/app/models/tamano-paquete.interface';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from '../../../models/response.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';
import { AddClienteComponent } from '../add-cliente/add-cliente.component';
import { TipoPaqueteInterface } from 'src/app/models/tipo-paquete.interface';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';
import { ClienteService } from 'src/app/services/api/cliente.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-edit-paquete',
  templateUrl: './edit-paquete.component.html',
  styleUrls: ['./edit-paquete.component.scss']
})
export class EditPaqueteComponent implements OnInit, HasUnsavedChanges {

  @ViewChild('inputPlaces') inputPlaces!: ElementRef;

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges()) {
      e.returnValue = '';
    }
  }

  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private api: PaqueteService,
    private alerts: AlertsService,
    private paqueteService: PaqueteService,
    private apiClient: ClienteService,
    private dialog: MatDialog,
    private renderer: Renderer2,
  ) { }

  hasUnsavedChanges(): boolean {
    this.loading = false;
    return this.editForm.dirty;
  }

  editRemitente = new FormGroup({
    idCliente: new FormControl(''),
    documentoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]),
    idTipoDocumento: new FormControl('', Validators.required),
    nombreCliente: new FormControl('', Validators.required),
    telefonoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
    correoCliente: new FormControl('', [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    direccionCliente: new FormControl('', Validators.required),
  });

  editForm = new FormGroup({
    idPaquete: new FormControl(''),
    codigoQrPaquete: new FormControl('', Validators.required),
    pesoPaquete: new FormControl('', [Validators.required, Validators.pattern('^\\d{0,3}(\\.\\d{0,2})?$')]),
    contenidoPaquete: new FormControl('', Validators.required),
    documentoDestinatario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]),
    nombreDestinatario: new FormControl('', Validators.required),
    correoDestinatario: new FormControl('', [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    telefonoDestinatario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
    fechaAproxEntrega: new FormControl('', [Validators.required, this.validateFechaPasada]),
    documentoRemitente: new FormControl('', Validators.required),
    idTamano: new FormControl(),
    idEstado: new FormControl('1'),
    idTipo: new FormControl('', Validators.required),
  })

  getFechAct() {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
  }

  validateFechaPasada(control: FormControl): { [key: string]: boolean } | null {
    const fechaSeleccionada = control.value;
    const fechaActual = new Date();

    // Establecer las horas, minutos, segundos y milisegundos de la fecha actual a 0
    fechaActual.setHours(0, 0, 0, 0);

    // Crear una nueva instancia de la fecha seleccionada y establecer las horas, minutos, segundos y milisegundos a 0
    const fechaSeleccionadaSinHora = new Date(fechaSeleccionada);
    fechaSeleccionadaSinHora.setHours(0, 0, 0, 0);

    // Sumar un día a la fecha seleccionada
    fechaSeleccionadaSinHora.setDate(fechaSeleccionadaSinHora.getDate() + 1);

    if (fechaSeleccionadaSinHora < fechaActual) {
      return { fechaPasada: true };
    }

    return null;
  }

  dataPaquete: PaqueteInterface[] = [];
  usuario: UsuarioInterface[] = [];
  remitente: ClienteInterface[] = [];
  destinatario: ClienteInterface[] = [];
  estadosPaquete: EstadoPaqueteInterface[] = [];
  tamanos: TamanoPaqueteInterface[] = [];
  tipos: TipoPaqueteInterface[] = [];
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
        'contenidoPaquete': this.dataPaquete[0]?.contenidoPaquete || '',
        'documentoDestinatario': this.dataPaquete[0]?.documentoDestinatario || '',
        'nombreDestinatario': this.dataPaquete[0]?.nombreDestinatario || '',
        'correoDestinatario': this.dataPaquete[0]?.correoDestinatario || '',
        'telefonoDestinatario': this.dataPaquete[0]?.telefonoDestinatario || '',
        'fechaAproxEntrega': this.dataPaquete[0]?.fechaAproxEntrega || '',
        'documentoRemitente': this.dataPaquete[0]?.documentoRemitente || '',
        'idTamano': this.dataPaquete[0]?.idTamano,
        'idEstado': this.dataPaquete[0]?.idEstado || 'idEstado',
        'idTipo': this.dataPaquete[0]?.idTipo || 'idTipo'
      });
      this.editRemitente.patchValue({
        'documentoCliente': this.dataPaquete[0]?.documentoRemitente || ''
      });
      this.loading = false;
    });
    this.getUsuarioPaquete();
    this.getRemitenteAndDestinatarioPaquete();
    this.getEstadoPaquete();
    this.getTamanoPaquete(); //:v
    this.getTipoPaquete();

    this.editRemitente.get('documentoCliente')?.valueChanges.subscribe(value => {
      if (this.editRemitente.get('documentoCliente')?.valid) {
        this.paqueteService.getDataRemitente(value).subscribe(data => {
          this.editRemitente.patchValue({
            idCliente: data.id,
            idTipoDocumento: data.tipoDocumento,
            nombreCliente: data.nombre,
            correoCliente: data.correo,
            telefonoCliente: data.telefono,
            direccionCliente: data.direccion
          });
          this.editForm.patchValue({
            documentoRemitente: data.documento
          });
        });
      }
    });

    this.editForm.get('documentoDestinatario')?.valueChanges.subscribe(value => {
      if (this.editForm.get('documentoDestinatario')?.dirty && this.editForm.get('documentoDestinatario')?.valid) {
        this.api.getDataDestinatario(value).subscribe(data => {
          this.editForm.patchValue({
            codigoQrPaquete: data.direccion,
            nombreDestinatario: data.nombre,
            correoDestinatario: data.correo,
            telefonoDestinatario: data.telefono,
          });
        });
      }
    });
  }

  ngAfterViewInit() {
    this.mapInput();
  }

  postForm(id: any) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Estás seguro que deseas modificar este paquete?',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.api.putPaquete(id).subscribe(data => {
          let respuesta: ResponseInterface = data;
          if (respuesta.status == 'ok') {
            this.editForm.reset();
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

  editRemi(id: any): void {
    if (this.editRemitente.get('telefonoCliente')?.dirty || this.editRemitente.get('correoCliente')?.dirty) {
      const dialogRef = this.dialog.open(DialogConfirmComponent, {
        data: {
          message: '¿Deseas modificar el correo y el teléfono este cliente?',
        },
      });
      const dialogRefSub = dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.loading = false;
          const putCltSub = this.apiClient.putCliente(id).subscribe((data) => {
            let respuesta: ResponseInterface = data;
            if (respuesta.status == 'ok') {
              this.alerts.showSuccess('El cliente ha sido modificado', 'Modificación exitosa');
            } else {
              this.alerts.showError(respuesta.msj, 'Error en la modificación');
              this.loading = false;
            }
          });
          this.subscriptions.add(putCltSub);
        } else {
          this.alerts.showInfo('No se ha modificado el cliente', 'Modificación cancelada');
        }
      });
      this.subscriptions.add(dialogRefSub);
    } else {
      if (!this.editRemitente.get('nombreCliente')?.value || !this.editRemitente.get('direccionCliente')?.value) {
        this.alerts.showInfo('Uno o mas campos vacios', 'Modificación cancelada');
      } else {
        this.alerts.showInfo('No se ha modificadon los campos correo o teléfono', 'Modificación cancelada');
      }
    }
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
      // obtener el remitente seleccionado al cargar la página
      const remitenteSeleccionado = this.editForm.get('documentoRemitente')?.value;
      // buscar el remitente seleccionado en la lista de remitentes
      this.selectedRemitente = this.remitente.find(remi => remi.documentoCliente === remitenteSeleccionado);

      this.destinatario = data;
      // obtener el remitente seleccionado al cargar la página
      const destinatarioSeleccionado = this.editForm.get('documentoDestinatario')?.value;
      // buscar el remitente seleccionado en la lista de remitentes
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

  getTipoPaquete(): void {
    this.api.getTipoPaquete().subscribe(data => {
      this.tipos = data;
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
      this.editForm.patchValue({ nombreDestinatario: this.selectedDestinatario.nombreCliente });
    } else {
      this.editForm.patchValue({ codigoQrPaquete: '' });
    }
  }
  mostrarCodigoQrPaquete() {
    this.hideCodigoQrPaquete = false;
  }

  openAddClienteDialog(): void {
    const dialogRef = this.dialog.open(AddClienteComponent, {
      width: '70%',
      height: '70%'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // actualizamos la info de remitente y destinatario
        this.api.getRemitenteAndDestinatario().subscribe(data => {
          this.remitente = data;
          this.destinatario = data;
        })
      }
    });
  }

  goBack() {
    this.loading = true;
    this.router.navigate(['paquete/list-paquetes']);
  }

  private mapInput() {
    const autocomplete = new google.maps.places.Autocomplete(this.renderer.selectRootElement(this.inputPlaces.nativeElement), {
      componentRestrictions: {
        country: ["CO"]
      },
      fields: ["formatted_address", "geometry"],
      types: ["address"]
    });

    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place: any = autocomplete.getPlace();
      if (place) {
        const selectedAddress = place.formatted_address;
        this.editForm.patchValue({ codigoQrPaquete: selectedAddress });
      }
    });
  }
}
