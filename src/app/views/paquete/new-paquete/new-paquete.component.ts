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


@Component({
  selector: 'app-new-paquete',
  templateUrl: './new-paquete.component.html',
  styleUrls: ['./new-paquete.component.scss']
})
export class NewPaqueteComponent implements OnInit {

  constructor(private router: Router, private api: PaqueteService, private alerts: AlertsService, private paqueteService: PaqueteService) { }

  newForm = new FormGroup({
    codigoQrPaquete: new FormControl('', Validators.required),
    documentoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
    documentoCliente: new FormControl('', Validators.required),
    idEstado: new FormControl('1'),
  })

  usuario: UsuarioInterface[] = [];
  cliente: ClienteInterface[] = [];
  estadosPaquete: EstadoPaqueteInterface[] = [];
  loading: boolean = true;

  ngOnInit(): void {
    this.getUsuarioPaquete();
    this.getClientePaquete();
    this.getEstadoPaquete();

    this.newForm.get('documentoCliente')?.valueChanges.subscribe((value) => {
      this.loading = true;
      this.paqueteService.getDireccionCliente(value).subscribe((data) => {
        if (data.direccion) {
          this.newForm.patchValue({
            codigoQrPaquete: data.direccion
          });
          this.loading = false;
        }
      });
    });
  }

  postForm(form: PaqueteInterface) {
    this.loading = true;
    this.api.postPaquete(form).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if (respuesta.status == 'ok') {
        this.alerts.showSuccess('El paquete ha sido registrado exitosamente', 'Paquete registrado');
        this.router.navigate(['paquete/list-paquetes']);
      }
      else {
        this.alerts.showError(respuesta.msj, 'Error al registrar el paquete');
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

  getClientePaquete(): void {
    this.api.getCliente().subscribe(data => {
      this.cliente = data;
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