import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TipoDocumentoInterface } from '../../../models/tipo-documento.interface';
import { ClienteInterface } from '../../../models/cliente.interface';
import { ClienteService } from '../../../services/api/cliente.service';

import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Subscription, forkJoin } from 'rxjs';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-cliente',
  templateUrl: './edit-cliente.component.html',
  styleUrls: ['./edit-cliente.component.scss']
})
export class EditClienteComponent implements OnInit, HasUnsavedChanges, OnDestroy {

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
    private api: ClienteService,
    private renderer: Renderer2,
    private dialog: MatDialog,
  ) { }

  dataCliente: ClienteInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = [];
  loading: boolean = true;

  @ViewChild('viewMap') viewMap!: TemplateRef<any>;

  hasUnsavedChanges(): boolean {
    this.loading = false;
    return this.editForm.dirty;
  }

  editForm = new FormGroup({
    idCliente: new FormControl(''),
    documentoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]),
    idTipoDocumento: new FormControl('', Validators.required),
    nombreCliente: new FormControl('', Validators.required),
    telefonoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
    correoCliente: new FormControl('', [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    direccionCliente: new FormControl('', Validators.required),
    detalleDireccionCliente: new FormControl(''),
    lat: new FormControl(),
    lng: new FormControl(),
  });

  ngOnInit(): void {
    let idCliente = this.activatedRouter.snapshot.paramMap.get('id');
    this.loading = true;

    const forkJoinSub = forkJoin([this.api.getOneCliente(idCliente), this.api.getTipoDocumento()]).subscribe(
      ([dataCliente, tiposDocumento]) => {
        this.dataCliente = dataCliente ? [dataCliente] : [];
        this.editForm.setValue({
          'idCliente': this.dataCliente[0]?.idCliente || '',
          'documentoCliente': this.dataCliente[0]?.documentoCliente || '',
          'idTipoDocumento': this.dataCliente[0]?.idTipoDocumento || '',
          'nombreCliente': this.dataCliente[0]?.nombreCliente || '',
          'telefonoCliente': this.dataCliente[0]?.telefonoCliente || '',
          'correoCliente': this.dataCliente[0]?.correoCliente || '',
          'direccionCliente': this.dataCliente[0]?.direccionCliente || '',
          'detalleDireccionCliente': this.dataCliente[0]?.detalleDireccionCliente || '',
          'lat': this.dataCliente[0]?.lat || '',
          'lng': this.dataCliente[0]?.lng || '',
        });
        this.tiposDocumento = tiposDocumento;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error en el servidor',
          text: 'Ha ocurrido un error al comunicarse con el servidor. Por favor, revisa tu conexión a internet o inténtalo nuevamente',
        });
      }
    );
    this.subscriptions.add(forkJoinSub);
  }

  ngAfterViewInit(): void {
    this.mapInput();
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this.subscriptions.unsubscribe();
  }


  postForm(id: any) {
    Swal.fire({
      icon: 'question',
      title: '¿Está seguro de que deseas modificar este cliente?',
      showCancelButton: true,
      showCloseButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        const putCltSub = this.api.putCliente(id).subscribe(
          (data) => {
            if (data.status == 'ok') {
              this.editForm.reset();
              this.router.navigate(['cliente/list-clientes']);
              Swal.fire({
                icon: 'success',
                title: 'Cliente modificado',
                text: 'El cliente ha sido modificado exitosamente.',
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
                title: 'Error al modificar',
                text: data.msj,
              });
            }
            this.loading = false;
          },
          (error) => {
            this.loading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error en el servidor',
              text: 'Ha ocurrido un error al comunicarse con el servidor. Por favor, revisa tu conexión a internet o inténtalo nuevamente',
            });
          });
        this.subscriptions.add(putCltSub);
      }
    });
  }

  goBack() {
    this.loading = true;
    this.router.navigate(['cliente/list-clientes']);
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
        const selectedAddress = place.formatted_address || place.name;
        this.editForm.patchValue({ direccionCliente: selectedAddress });
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        this.editForm.patchValue({ lat: lat, lng: lng });
      }
    });
  }

  openMapDialog() {
    const dialogRef = this.dialog.open(this.viewMap, {
      width: '500px',
    });

    dialogRef.afterOpened().subscribe(() => {
      this.initMap();
    });
  }

  initMap() {
    let mapOptions: any;
    let map!: google.maps.Map;
    let selectedLocation: { lat: number, lng: number } | null = null;
    let selectedLocationMarker: google.maps.Marker | null = null;
  
    if (this.editForm.value.lat == null || this.editForm.value.lng == null) {
      mapOptions = {
        center: { lat: 6.25670, lng: -75.57496 },
        zoom: 11,
      };
    } else {
      mapOptions = {
        center: { lat: this.editForm.value.lat, lng: this.editForm.value.lng },
        zoom: 15,
      }
  
      selectedLocation = { lat: this.editForm.value.lat, lng: this.editForm.value.lng };
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
  
          this.editForm.patchValue({
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