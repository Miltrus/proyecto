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


@Component({
  selector: 'app-new-paquete',
  templateUrl: './new-paquete.component.html',
  styleUrls: ['./new-paquete.component.scss']
})
export class NewPaqueteComponent implements OnInit {

  constructor(private router: Router, private api: PaqueteService, private alerts: AlertsService, private paqueteService: PaqueteService) { }

  remitenteForm = new FormGroup({
    documentoRemitente: new FormControl('', Validators.required),
    nombreRemitente: new FormControl('', Validators.required),
    telefonoRemitente: new FormControl('', Validators.required),
    correoRemitente: new FormControl('', Validators.required),
    idEstado: new FormControl('1'),
  });

  destinatarioForm = new FormGroup({
    documentoDestinatario: new FormControl('', Validators.required),
    direccionDestinatario: new FormControl('', Validators.required),
    nombreDestinatario: new FormControl('', Validators.required),
    telefonoDestinatario: new FormControl('', Validators.required),
    correoDestinatario: new FormControl('', Validators.required),
  });

  usuario: UsuarioInterface[] = [];
  remitente: ClienteInterface[] = [];
  destinatario: ClienteInterface[] = [];
  estadosPaquete: EstadoPaqueteInterface[] = [];
  tamanoPaquete: TamanoPaqueteInterface[] = [];
  loading: boolean = true;

  ngOnInit(): void {
    this.getUsuarioPaquete();
    this.getRemitentePaquete();
    this.getDestinatarioPaquete();
    this.getEstadoPaquete();

    /* this.remitenteForm.get('documentoRemitente')?.valueChanges.subscribe((value) => {
      this.loading = true;
      this.paqueteService.getDocumentoRemitente(value).subscribe((data) => {
        if (data.documento) {
          this.remitenteForm.patchValue({
            documentoRemitente: data.documento
          });
          this.loading = false;
        }
      });
    }); */

    this.remitenteForm.get('documentoRemitente')?.valueChanges.subscribe((value) => {
      this.loading = true;
      this.paqueteService.getNombreRemitente(value).subscribe((data) => {
        if (data.nombre) {
          this.remitenteForm.patchValue({
            nombreRemitente: data.nombre
          });
          this.loading = false;
        }
      });
    });

    this.remitenteForm.get('documentoRemitente')?.valueChanges.subscribe((value) => {
      this.loading = true;
      this.paqueteService.getTelefonoRemitente(value).subscribe((data) => {
        if (data.telefono) {
          this.remitenteForm.patchValue({
            telefonoRemitente: data.telefono
          });
          this.loading = false;
        }
      });
    });

    this.remitenteForm.get('documentoRemitente')?.valueChanges.subscribe((value) => {
      this.loading = true;
      this.paqueteService.getCorreoRemitente(value).subscribe((data) => {
        if (data.correo) {
          this.remitenteForm.patchValue({
            correoRemitente: data.correo
          });
          this.loading = false;
        }
      });
    });


    this.destinatarioForm.get('documentoDestinatario')?.valueChanges.subscribe((value) => {
      this.loading = true;
      this.paqueteService.getNombreDestinatario(value).subscribe((data) => {
        if (data.nombre) {
          this.destinatarioForm.patchValue({
            nombreDestinatario: data.nombre
          });
          this.loading = false;
        }
      });
    });

    this.destinatarioForm.get('documentoDestinatario')?.valueChanges.subscribe((value) => {
      this.loading = true;
      this.paqueteService.getTelefonoDestinatario(value).subscribe((data) => {
        if (data.telefono) {
          this.destinatarioForm.patchValue({
            telefonoDestinatario: data.telefono
          });
          this.loading = false;
        }
      });
    });

    this.destinatarioForm.get('documentoDestinatario')?.valueChanges.subscribe((value) => {
      this.loading = true;
      this.paqueteService.getCorreoDestinatario(value).subscribe((data) => {
        if (data.correo) {
          this.destinatarioForm.patchValue({
            correoDestinatario: data.correo
          });
          this.loading = false;
        }
      });
    });

    this.destinatarioForm.get('documentoDestinatario')?.valueChanges.subscribe((value) => {
      this.loading = true;
      this.paqueteService.getDireccionDestinatario(value).subscribe((data) => {
        if (data.direccion) {
          this.destinatarioForm.patchValue({
            direccionDestinatario: data.direccion
          });
          this.loading = false;
        }
      });
    });

  }

  postRemitenteForm() {
    this.loading = true;
    this.api.postPaquete(this.remitenteForm.value).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if (respuesta.status == 'ok') {
        this.alerts.showSuccess('El paquete del remitente ha sido registrado exitosamente', 'Paquete registrado');
        this.router.navigate(['paquete/list-paquetes']);
      } else {
        this.alerts.showError(respuesta.msj, 'Error al registrar el paquete del remitente');
      }
      this.loading = false;
    });
  }

  postDestinatarioForm() {
    this.loading = true;
    this.api.postPaquete(this.destinatarioForm.value).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if (respuesta.status == 'ok') {
        this.alerts.showSuccess('El paquete del destinatario ha sido registrado exitosamente', 'Paquete registrado');
        this.router.navigate(['paquete/list-paquetes']);
      } else {
        this.alerts.showError(respuesta.msj, 'Error al registrar el paquete del destinatario');
      }
      this.loading = false;
    });
  }

  getUsuarioPaquete(): void {
    this.api.getUsuario().subscribe(data => {
      this.usuario = data;
      this.loading = false;
    });
  }

  getRemitentePaquete(): void {
    this.api.getRemitente().subscribe(data => {
      this.remitente = data;
      this.loading = false;
    });
  }

  getDestinatarioPaquete(): void {
    this.api.getDestinatario().subscribe(data => {
      this.destinatario = data;
      this.loading = false;
    });
  }

  getEstadoPaquete(): void {
    this.api.getEstadoPaquete().subscribe(data => {
      this.estadosPaquete = data;
      this.loading = false;
    });
  }

  goBack() {
    this.loading = true;
    this.router.navigate(['paquete/list-paquetes']);
  }
}
