import { Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { PaqueteService } from '../../../services/api/paquete.service';
import { PaqueteInterface } from '../../../models/paquete.interface';
import { ResponseInterface } from '../../../models/response.interface';
import { UsuarioInterface } from 'src/app/models/usuario.interface';
import { ClienteInterface } from 'src/app/models/cliente.interface';
import { EstadoPaqueteInterface } from 'src/app/models/estado-paquete.interface';
import { TamanoPaqueteInterface } from 'src/app/models/tamano-paquete.interface';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { AddClienteComponent } from '../add-cliente/add-cliente.component';
import { TipoPaqueteInterface } from 'src/app/models/tipo-paquete.interface';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';


@Component({
  selector: 'app-new-paquete',
  templateUrl: './new-paquete.component.html',
  styleUrls: ['./new-paquete.component.scss']
})
export class NewPaqueteComponent implements OnInit, HasUnsavedChanges {

  @ViewChild('inputPlaces') inputPlaces!: ElementRef;
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    return this.hasUnsavedChanges() === false;
  }

  constructor(
    private router: Router,
    private api: PaqueteService,
    private alerts: AlertsService,
    private dialog: MatDialog,
    private paqueteService: PaqueteService,
    private renderer: Renderer2,
  ) { }

  hasUnsavedChanges(): boolean {
    this.loading = false;
    return this.newForm.dirty;
  }

  newForm = new FormGroup({
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
  });

  getFechAct() {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
  }

  usuario: UsuarioInterface[] = [];
  remitente: any[] = [];
  destinatario: any[] = [];
  estadosPaquete: EstadoPaqueteInterface[] = [];
  tamanos: TamanoPaqueteInterface[] = [];
  tipos: TipoPaqueteInterface[] = [];
  loading: boolean = true;
  hideCodigoQrPaquete: boolean = true;
  respuesta: ResponseInterface | ClienteInterface[] | any = [];

  selectedRemitente: ClienteInterface | undefined;
  selectedDestinatario: ClienteInterface | undefined;


  ngOnInit(): void {
    this.api.getRemitenteAndDestinatario().subscribe(data => {
      this.remitente = data;
      this.destinatario = data;
      this.loading = false;

      if (data.length == 0) {
        this.alerts.showWarning('No hay ningun cliente registrado', 'No hay clientes');
        return;
      }
    });
    this.getUsuarioPaquete();
    this.getEstadoPaquete();
    this.getTamanoPaquete();
    this.getTipoPaquete();

    this.newForm.get('documentoDestinatario')?.valueChanges.subscribe(value => {
      if (this.newForm.get('documentoDestinatario')?.valid) {
        this.paqueteService.getDataDestinatario(value).subscribe(data => {
          this.newForm.patchValue({
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



  postForm(form: PaqueteInterface) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Estás seguro que deseas registrar este paquete?'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.api.postPaquete(form).subscribe(data => {
          let respuesta: ResponseInterface = data;
          if (respuesta.status == 'ok') {
            this.newForm.reset();
            this.alerts.showSuccess('El paquete ha sido creado exitosamente', 'Paquete registrado');
            this.router.navigate(['paquete/list-paquetes']);
          }
          else {
            this.alerts.showError(respuesta.msj, 'Error al registrar el paquete');
            this.loading = false;
          }
        });
      } else {
        this.alerts.showInfo('El paquete no ha sido creado', 'Paquete no creado');
      }
    });
  }


  getUsuarioPaquete(): void {
    this.api.getUsuario().subscribe(data => {
      this.usuario = data;
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

  getTipoPaquete(): void {
    this.api.getTipoPaquete().subscribe(data => {
      this.tipos = data;
      this.loading = false;
    });
  }

  getDestinatarioPaquete(): void {
    this.api.getRemitenteAndDestinatario().subscribe(data => {
      this.destinatario = data;
      this.loading = false;
    });
  }

  onDestinatarioInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.selectedDestinatario = this.destinatario.find(dest => dest.nombreCliente === value);
  }

  onRemitenteSelectionChange(event: any) {
    const documentoCliente = event.value;
    this.selectedRemitente = this.remitente.find(remi => remi.documentoCliente === documentoCliente);
  }

  onDestinatarioSelectionChange(event: any) {
    const documentoCliente = event.value;
    this.selectedDestinatario = this.destinatario.find(desti => desti.documentoCliente === documentoCliente);
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
        this.newForm.patchValue({ codigoQrPaquete: selectedAddress });
      }
    });
  }
}
