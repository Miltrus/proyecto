import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { PaqueteService } from '../../../services/api/paquete/paquete.service';
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


@Component({
  selector: 'app-new-paquete',
  templateUrl: './new-paquete.component.html',
  styleUrls: ['./new-paquete.component.scss']
})
export class NewPaqueteComponent implements OnInit {

  constructor(
    private router: Router,
    private api: PaqueteService,
    private alerts: AlertsService,
    private dialog: MatDialog,
    private paqueteService: PaqueteService,
  ) { }

  
  

  newForm = new FormGroup({
    codigoQrPaquete: new FormControl('', Validators.required),
    pesoPaquete: new FormControl('', [Validators.required, Validators.pattern('^\\d{0,3}(\\.\\d{0,2})?$')]),
    unidadesPaquete: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{0,3}$')]),
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
      this.paqueteService.getDireccionDestinatario(value).subscribe(data => {

        if (data.direccion) {
          this.newForm.patchValue({
            codigoQrPaquete: data.direccion
          });
        }
      });
    }
    );
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
    });
  }

  goBack() {
    this.loading = true;
    this.router.navigate(['paquete/list-paquetes']);
  }
}
