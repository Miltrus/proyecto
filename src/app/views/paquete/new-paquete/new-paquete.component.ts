import { Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { PaqueteService } from '../../../services/api/paquete.service';
import { PaqueteInterface } from '../../../models/paquete.interface';
import { UsuarioInterface } from 'src/app/models/usuario.interface';
import { ClienteInterface } from 'src/app/models/cliente.interface';
import { EstadoPaqueteInterface } from 'src/app/models/estado-paquete.interface';
import { TamanoPaqueteInterface } from 'src/app/models/tamano-paquete.interface';
import { MatDialog } from '@angular/material/dialog';
import { AddClienteComponent } from '../add-cliente/add-cliente.component';
import { TipoPaqueteInterface } from 'src/app/models/tipo-paquete.interface';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';
import { ClienteService } from 'src/app/services/api/cliente.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-new-paquete',
  templateUrl: './new-paquete.component.html',
  styleUrls: ['./new-paquete.component.scss']
})
export class NewPaqueteComponent implements OnInit, HasUnsavedChanges {

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
    private api: PaqueteService,
    private apiClient: ClienteService,
    private alerts: AlertsService,
    private dialog: MatDialog,
    private paqueteService: PaqueteService,
    private renderer: Renderer2,
  ) { }

  hasUnsavedChanges(): boolean {
    this.loading = false;
    return this.newForm.dirty;
  }

  lat!: any;
  lng!: any;

  editRemitente = new FormGroup({
    idCliente: new FormControl(''),
    documentoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]),
    idTipoDocumento: new FormControl('', Validators.required),
    nombreCliente: new FormControl('', Validators.required),
    telefonoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
    correoCliente: new FormControl('', [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    direccionCliente: new FormControl('', Validators.required),
  });

  newForm = new FormGroup({
    codigoQrPaquete: new FormControl('', Validators.required),
    pesoPaquete: new FormControl('', [Validators.required, Validators.pattern('^\\d{0,3}(\\.\\d{0,2})?$')]),
    contenidoPaquete: new FormControl('', Validators.required),
    documentoDestinatario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]),
    nombreDestinatario: new FormControl('', Validators.required),
    correoDestinatario: new FormControl('', [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    telefonoDestinatario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
    fechaAproxEntrega: new FormControl('', [Validators.required, this.validateFechaPasada]),
    documentoRemitente: new FormControl(''),
    idTamano: new FormControl(),
    idEstado: new FormControl('1'),
    idTipo: new FormControl('', Validators.required),
    lat: new FormControl(this.lat),
    lng: new FormControl(this.lng),
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
  remitentesFiltrados: any[] = [];
  cliente: any[] = [];
  destinatario: any[] = [];
  estadosPaquete: EstadoPaqueteInterface[] = [];
  tamanos: TamanoPaqueteInterface[] = [];
  tipos: TipoPaqueteInterface[] = [];
  loading: boolean = true;
  hideCodigoQrPaquete: boolean = true;

  selectedRemitente: ClienteInterface | undefined;
  selectedDestinatario: ClienteInterface | undefined;

  ngOnInit(): void {
    this.api.getRemitenteAndDestinatario().subscribe(data => {
      this.remitente = data;
      this.destinatario = data;
      this.cliente = data.map(cliente => cliente.nombreCliente);
      this.loading = false;

      if (data.length == 0) {
        Swal.fire({
          icon: 'info',
          title: 'No hay clientes registrados',
          text: 'No se encontraron clientes en el sistema.',
        });
        return;
      }
    });
    this.getUsuarioPaquete();
    this.getEstadoPaquete();
    this.getTamanoPaquete();
    this.getTipoPaquete();

    this.editRemitente.get('documentoCliente')?.valueChanges.subscribe(value => {
      if (this.editRemitente.get('documentoCliente')?.valid) {
        this.paqueteService.getDataRemitente(value).subscribe(data => {
          this.editRemitente.patchValue({
            idCliente: data.idCliente,
            idTipoDocumento: data.idTipoDocumento,
            nombreCliente: data.nombre,
            correoCliente: data.correo,
            telefonoCliente: data.telefono,
            direccionCliente: data.direccion
          });
          this.newForm.patchValue({
            documentoRemitente: data.documento
          });
        });
      }
    });

    this.newForm.get('documentoDestinatario')?.valueChanges.subscribe(value => {
      if (this.newForm.get('documentoDestinatario')?.valid) {
        this.paqueteService.getDataDestinatario(value).subscribe(data => {
          this.newForm.patchValue({
            codigoQrPaquete: data.direccion,
            nombreDestinatario: data.nombre,
            correoDestinatario: data.correo,
            telefonoDestinatario: data.telefono,
            lat: data.lat,
            lng: data.lng
          });
        });
      }
    });
  }

  ngAfterViewInit() {
    this.mapInput();
  }

  filtrarOpciones(event: Event) {
    const valorInput = (event.target as HTMLInputElement).value;
    // Filtrar las opciones según el valor ingresado en el input
    // y actualizar el array de opcionesAutocompletado con las opciones filtradas
    this.cliente = this.filtrarFrutas(valorInput);
  }

  filtrarFrutas(valor: string): string[] {
    return this.cliente.filter(r =>
      r.toLowerCase().includes(valor.toLowerCase())
    );
  }

  filtrarRemitentes(event: Event) {
    const valorInput = (event.target as HTMLInputElement).value;
    this.remitentesFiltrados = this.filtrarPorNombre(valorInput);
  }

  filtrarPorNombre(valor: string): any[] {
    const filtro = valor.toLowerCase();
    return this.remitente.filter(remi => remi.nombreCliente.toLowerCase().includes(filtro));
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
    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro de que deseas registrar este paquete?',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(form);
        this.loading = true;
        this.api.postPaquete(form).subscribe(data => {
          if (data.status == 'ok') {
            this.newForm.reset();
            this.router.navigate(['paquete/list-paquetes']);
            Swal.fire({
              icon: 'success',
              title: 'Paquete registrado',
              text: 'El paquete ha sido registrado exitosamente.',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al registrar el paquete',
              text: data.msj,
            });
            this.loading = false;
          }
        });
      }
    });
  }


  editRemi(id: any): void {
    if (this.editRemitente.get('telefonoCliente')?.dirty || this.editRemitente.get('correoCliente')?.dirty) {
      Swal.fire({
        title: '¿Deseas modificar el correo y el teléfono de este cliente?',
        icon: 'question',
        showCancelButton: true,
        reverseButtons: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.loading = true;
          const putCltSub = this.apiClient.putCliente(id).subscribe((data) => {
            Swal.fire({
              icon: data.status == "ok" ? 'success' : 'error',
              title: data.status == "ok" ? 'Cliente modificado' : 'Error al modificar el cliente',
              text: data.msj,
            });
            this.loading = false;
          });
          this.subscriptions.add(putCltSub);
        }
      });
    } else {
      if (!this.editRemitente.get('nombreCliente')?.value || !this.editRemitente.get('direccionCliente')?.value) {
        this.alerts.showInfo('No se han modificado los campos correo o teléfono.', 'Modificación cancelada');
      } else {
        this.alerts.showInfo('No se han modificado los campos correo o teléfono.', 'Modificación cancelada');
      }
    }
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

  mostrarCodigoQrPaquete() {
    this.hideCodigoQrPaquete = false;
  }

  openAddClienteDialog(): void {
    const dialogRef = this.dialog.open(AddClienteComponent, {
      width: '65%',
      height: '65%',
      autoFocus: false,
      disableClose: true,
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
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        this.newForm.patchValue({ lat: lat, lng: lng });
        console.log("Latitud:", lat);
        console.log("Longitud:", lng);
      }
    });
  }
}
