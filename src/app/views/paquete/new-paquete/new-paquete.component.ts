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
    private paqueteService: PaqueteService
  ) { }

  newForm = new FormGroup({
    documentoRemitente: new FormControl('', Validators.required),
    documentoDestinatario: new FormControl('', Validators.required),
    pesoPaquete: new FormControl('', Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')),
    idTamano: new FormControl('', Validators.required),
    codigoQrPaquete: new FormControl(''),
    idEstado: new FormControl('1'),
  });

  usuario: UsuarioInterface[] = [];
  remitente: any[] = [];
  destinatario: any[] = [];
  estadosPaquete: EstadoPaqueteInterface[] = [];
  tamanos: TamanoPaqueteInterface[] = [];
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
        this.alerts.showInfo('No hay ningun cliente registrado', 'No hay clientes');
        return;
      }
    });
    this.getUsuarioPaquete();
    this.getEstadoPaquete();
    this.getTamanoPaquete();

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
  getDestinatarioPaquete(): void {
    this.api.getRemitenteAndDestinatario().subscribe(data => {
      this.destinatario = data;
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
  }
  mostrarCodigoQrPaquete() {
    this.hideCodigoQrPaquete = false;
  }

  goBack() {
    this.loading = true;
    this.router.navigate(['paquete/list-paquetes']);
  }
}
