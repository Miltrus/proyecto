import { Component, ElementRef, HostListener, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ClienteService } from '../../../services/api/cliente.service';
import { ClienteInterface } from '../../../models/cliente.interface';
import { ResponseInterface } from '../../../models/response.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-cliente',
  templateUrl: './new-cliente.component.html',
  styleUrls: ['./new-cliente.component.scss']
})
export class NewClienteComponent implements OnInit, HasUnsavedChanges, OnDestroy {

  @ViewChild('inputPlaces') inputPlaces!: ElementRef;

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    return this.hasUnsavedChanges() === false;
  }

  constructor(
    private router: Router,
    private api: ClienteService,
    private alerts: AlertsService,
    private dialog: MatDialog,
    private renderer: Renderer2,
  ) { }

  private subscriptions: Subscription = new Subscription();

  tiposDocumento: TipoDocumentoInterface[] = []
  loading: boolean = true;
  savedChanges: boolean = false;

  hasUnsavedChanges(): boolean {
    this.loading = false;
    return this.newForm.dirty && !this.savedChanges;
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
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Estás seguro que deseas crear este cliente?'
      }
    });
    const dialogRefSub = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        const postCltSub = this.api.postCliente(form).subscribe(data => {
          this.savedChanges = true;
          let respuesta: ResponseInterface = data;
          if (respuesta.status == 'ok') {
            this.alerts.showSuccess('El cliente ha sido creado exitosamente', 'Cliente creado');
            this.router.navigate(['cliente/list-clientes']);
          }
          else {
            this.alerts.showError(respuesta.msj, 'Error al crear el cliente');
            this.loading = false;
          }
        });
        this.subscriptions.add(postCltSub);
      } else {
        this.alerts.showInfo('El cliente no ha sido creado', 'Cliente no creado');
      }
    });
    this.subscriptions.add(dialogRefSub);
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