import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TipoDocumentoInterface } from '../../../models/tipo-documento.interface';
import { ClienteInterface } from '../../../models/cliente.interface';
import { ClienteService } from '../../../services/api/cliente.service';

import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Subscription, forkJoin } from 'rxjs';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';
import Swal from 'sweetalert2';

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
  ) { }



  dataCliente: ClienteInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = [];
  loading: boolean = true;

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
        });
        this.tiposDocumento = tiposDocumento;
        this.loading = false;
      },
      (error) => {
        console.error('Error:', error);
        this.loading = false;
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
        const putCltSub = this.api.putCliente(id).subscribe((data) => {
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
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al modificar',
              text: data.msj,
            });
          }
          this.loading = false;
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
      types: ["address"] // Agrega el tipo "establishment" para lugares
    });

    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place: any = autocomplete.getPlace();
      if (place) {
        const selectedAddress = place.formatted_address || place.name; // Utiliza el nombre del lugar si no hay una dirección formateada
        this.editForm.patchValue({ direccionCliente: selectedAddress });
      }
    });
  }
}