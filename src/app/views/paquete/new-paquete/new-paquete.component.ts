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
import { LoginComponent } from 'src/app/components/login/login.component';


@Component({
  selector: 'app-new-paquete',
  templateUrl: './new-paquete.component.html',
  styleUrls: ['./new-paquete.component.scss']
})
export class NewPaqueteComponent implements OnInit {

  constructor(private router: Router, private api: PaqueteService, private alerts: AlertsService, private auth: LoginComponent, private paqueteService: PaqueteService) { }

  newForm = new FormGroup({
    codigoQrPaquete: new FormControl(''),
    documentoUsuario: new FormControl(''),
    documentoCliente: new FormControl(''),
    idEstado: new FormControl(''),
  })

  usuario: UsuarioInterface[] = [];
  cliente: ClienteInterface[] = [];
  estadosPaquete: EstadoPaqueteInterface[] = [];

  ngOnInit(): void {
    this.auth.checkLocalStorage();
    this.getUsuarioPaquete();
    this.getClientePaquete();
    this.getEstadoPaquete();

    this.newForm.get('documentoCliente')?.valueChanges.subscribe((value) => {
      this.paqueteService.getDireccionCliente(value).subscribe((data) => {
        if (data.direccion) {
          this.newForm.patchValue({
            codigoQrPaquete: data.direccion
          });
        }
      });
    });
  }

  postForm(form: PaqueteInterface) {
    this.api.postPaquete(form).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if (respuesta.status == 'ok') {
        this.alerts.showSuccess('El paquete ha sido creado exitosamente.', 'Paquete creado');
        this.router.navigate(['paquete/list-paquetes']);
      }
      else {
        this.alerts.showError(respuesta.msj, 'Error al crear el paquete');
      }
    });
  }

  getUsuarioPaquete(): void {
    this.api.getUsuario().subscribe(
      (data: UsuarioInterface[]) => {
        this.usuario = data;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getClientePaquete(): void {
    this.api.getCliente().subscribe(
      (data: ClienteInterface[]) => {
        this.cliente = data;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getEstadoPaquete(): void {
    this.api.getEstadoPaquete().subscribe(
      (data: EstadoPaqueteInterface[]) => {
        this.estadosPaquete = data;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  goBack(){
    this.router.navigate(['paquete/list-paquetes']);
  }
}