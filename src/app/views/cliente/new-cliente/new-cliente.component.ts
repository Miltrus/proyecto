import { Component, ElementRef, HostListener, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteService } from '../../../services/api/cliente.service';
import { ClienteInterface } from '../../../models/cliente.interface';
import { ResponseInterface } from '../../../models/response.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-cliente',
  templateUrl: './new-cliente.component.html',
  styleUrls: ['./new-cliente.component.scss']
})
export class NewClienteComponent implements OnInit, HasUnsavedChanges, OnDestroy {

  @ViewChild('inputPlaces') inputPlaces!: ElementRef;

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges()) {
      e.returnValue = '';
    }
  }

  constructor(
    private router: Router,
    private api: ClienteService,
    private renderer: Renderer2,
  ) { }

  private subscriptions: Subscription = new Subscription();

  tiposDocumento: TipoDocumentoInterface[] = []
  loading: boolean = true;

  hasUnsavedChanges(): boolean {
    this.loading = false;
    return this.newForm.dirty
  }

  newForm = new FormGroup({
    idCliente: new FormControl(''),
    documentoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]),
    idTipoDocumento: new FormControl('', Validators.required),
    nombreCliente: new FormControl('', Validators.required),
    telefonoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]), // Agregamos la validación de patrón usando Validators.pattern
    correoCliente: new FormControl('', [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    direccionCliente: new FormControl('', Validators.required),
  })


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
      icon: 'question',
      title: '¿Estás seguro de que deseas crear este cliente?',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        const postCltSub = this.api.postCliente(form).subscribe(data => {
          let respuesta: ResponseInterface = data;
          if (respuesta.status == 'ok') {
            this.newForm.reset();
            this.router.navigate(['cliente/list-clientes']);
            Swal.fire({
              icon: 'success',
              title: 'Cliente creado',
              text: 'El cliente ha sido creado exitosamente.',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al crear',
              text: respuesta.msj,
            });
          }
          this.loading = false;
        });

        this.subscriptions.add(postCltSub);
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
        const selectedAddress = place.formatted_address;
        this.newForm.patchValue({ direccionCliente: selectedAddress });
      }
    });
  }
}