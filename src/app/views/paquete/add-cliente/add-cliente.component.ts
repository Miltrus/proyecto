import { Component, ElementRef, HostListener, OnDestroy, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ClienteService } from '../../../services/api/cliente.service';
import { ClienteInterface } from '../../../models/cliente.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-cliente',
  templateUrl: './add-cliente.component.html',
  styleUrls: ['./add-cliente.component.scss']
})
export class AddClienteComponent implements OnInit, HasUnsavedChanges, OnDestroy {

  @ViewChild('inputPlaces') inputPlaces!: ElementRef;

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges()) {
      e.returnValue = '';
    }
  }

  constructor(
    private dialogRef: MatDialogRef<AddClienteComponent>,
    private api: ClienteService,
    private renderer: Renderer2,
    private dialog: MatDialog,
  ) { }

  private subscriptions: Subscription = new Subscription();

  @ViewChild('viewMap') viewMap!: TemplateRef<any>;


  hasUnsavedChanges(): boolean {
    this.loading = false;
    return this.newForm.dirty
  }

  newForm = new FormGroup({
    documentoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]),
    idTipoDocumento: new FormControl('', [Validators.required]),
    nombreCliente: new FormControl('', Validators.required),
    telefonoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
    correoCliente: new FormControl('', [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    direccionCliente: new FormControl('', Validators.required),
    detalleDireccionCliente: new FormControl(''),
    lat: new FormControl(),
    lng: new FormControl(),
  })

  tiposDocumento: TipoDocumentoInterface[] = []
  clientes: ClienteInterface[] = []
  loading: boolean = true;

  ngOnInit(): void {
    const getTipoDocSub = this.api.getTipoDocumento().subscribe(data => {
      this.tiposDocumento = data;
      this.loading = false;
    });
    this.subscriptions.add(getTipoDocSub);
  }

  ngAfterViewInit(): void {
    this.mapInput();
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this.subscriptions.unsubscribe();
  }

  postForm(form: ClienteInterface) {
    Swal.fire({
      title: '¿Estás seguro de que deseas registrar este remitente?',
      icon: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      reverseButtons: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        const postCltSub = this.api.postCliente(form).subscribe(data => {
          if (data.status == 'ok') {
            this.newForm.reset();
            Swal.fire({
              icon: 'success',
              title: 'Remitente creado',
              text: 'El remitente ha sido creado exitosamente.',
              toast: true,
              showConfirmButton: false,
              timer: 5000,
              position: 'top-end',
              timerProgressBar: true,
              showCloseButton: true,
            });
            this.dialogRef.close(form);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al crear el remitente',
              text: data.msj,
            });
            this.loading = false;
          }
        },
          (error) => {
            this.loading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error en el servidor',
              text: 'Ha ocurrido un error al comunicarse con el servidor. Por favor, revisa tu conexión a internet o inténtalo nuevamente',
            });
          });
        this.subscriptions.add(postCltSub);
      }
    });
  }


  closeDialog() {
    if (this.newForm.dirty) {
      Swal.fire({
        icon: 'warning',
        title: 'Cambios sin guardar',
        text: '¿Estás seguro de que deseas salir sin guardar los cambios?',
        showDenyButton: true,
        showCancelButton: true,
        showConfirmButton: false,
        reverseButtons: true,
        cancelButtonText: 'Cancelar',
        denyButtonText: 'Salir',
      }).then((result) => {
        if (result.isDenied) {
          this.dialogRef.close();
        }
      });
    } else {
      this.dialogRef.close();
    }
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
        this.newForm.patchValue({ direccionCliente: selectedAddress });
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        this.newForm.patchValue({ lat: lat, lng: lng });
      }
    });
  }

  openMapDialog() {
    const dialogMap = this.dialog.open(this.viewMap, {
      width: '500px',
    });

    dialogMap.afterOpened().subscribe(() => {
      this.initMap();
    });
  }

  initMap() {
    let mapOptions: any;
    let map!: google.maps.Map;
    let selectedLocation: { lat: number, lng: number } | null = null;
    let selectedLocationMarker: google.maps.Marker | null = null;
  
    if (this.newForm.value.lat == null || this.newForm.value.lng == null) {
      mapOptions = {
        center: { lat: 6.25670, lng: -75.57496 },
        zoom: 11,
      };
    } else {
      mapOptions = {
        center: { lat: this.newForm.value.lat, lng: this.newForm.value.lng },
        zoom: 15,
      }
  
      selectedLocation = { lat: this.newForm.value.lat, lng: this.newForm.value.lng };
    }
  
    map = new google.maps.Map(document.getElementById('map')!, mapOptions);
  

    function addSelectedLocationMarker() {
      if (selectedLocation) {
        selectedLocationMarker = new google.maps.Marker({
          position: selectedLocation,
          map: map,
          title: 'Ubicación seleccionada',
        });
      }
    }
  
    addSelectedLocationMarker();
  
    // Crea un objeto de geocodificación inversa
    const geocoder = new google.maps.Geocoder();
  
    // Agrega un evento click al mapa
    google.maps.event.addListener(map, 'click', (event: google.maps.MapMouseEvent) => {
      selectedLocation = { lat: event.latLng!.lat(), lng: event.latLng!.lng() };
  
      // Realiza la geocodificación inversa para obtener la dirección
      geocoder.geocode({ location: selectedLocation }, (results, status) => {
        if (status === 'OK' && results![0]) {
          const formattedAddress = results![0].formatted_address;
  
          this.newForm.patchValue({
            direccionCliente: formattedAddress,
            lat: selectedLocation!['lat'],
            lng: selectedLocation!['lng']
          });
  
          if (selectedLocationMarker) {
            selectedLocationMarker.setMap(null);
          }
  
          addSelectedLocationMarker();
  
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error al obtener la dirección',
            text: 'No se ha podido obtener la dirección de la ubicación seleccionada. Por favor, inténtalo nuevamente.',
          });
        }
      });
    });
  }
}
