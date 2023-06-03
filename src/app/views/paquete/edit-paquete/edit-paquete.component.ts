import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ClienteInterface } from '../../../models/cliente.interface';
import { EstadoPaqueteInterface } from '../../../models/estado-paquete.interface';
import { UsuarioInterface } from '../../../models/usuario.interface';
import { PaqueteInterface } from '../../../models/paquete.interface';
import { PaqueteService } from '../../../services/api/paquete/paquete.service';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from '../../../models/response.interface';
import { LoginComponent } from 'src/app/components/login/login.component';

@Component({
  selector: 'app-edit-paquete',
  templateUrl: './edit-paquete.component.html',
  styleUrls: ['./edit-paquete.component.scss']
})
export class EditPaqueteComponent implements OnInit {

  constructor(
    private router: Router, 
    private activatedRouter: ActivatedRoute, 
    private api: PaqueteService, 
    private alerts: AlertsService,
    private auth: LoginComponent,
    ) { }

  editForm = new FormGroup({
    idPaquete: new FormControl(''),
    codigoQrPaquete: new FormControl(''),
    documentoUsuario: new FormControl(''),
    documentoCliente: new FormControl(''),
    idEstado: new FormControl(''),
  })

  dataPaquete: PaqueteInterface[] = [];
  usuario: UsuarioInterface[] = [];
  cliente: ClienteInterface[] = [];
  estadosPaquete: EstadoPaqueteInterface[] = [];

  ngOnInit(): void {
    this.auth.checkLocalStorage();

    let idPaquete = this.activatedRouter.snapshot.paramMap.get('id');
    this.api.getOnePaquete(idPaquete).subscribe(data => {
      this.dataPaquete = data ? [data] : []; //si data encontró algun valor, lo asignamos a dataRol envuelto en un arreglo, si data es null asignamos un arreglo vacio, si no se hace esto da error
      this.editForm.setValue({
        'idPaquete': this.dataPaquete[0]?.idPaquete || 'idPaquete',
        'codigoQrPaquete': this.dataPaquete[0]?.codigoQrPaquete || '',
        'documentoUsuario': this.dataPaquete[0]?.documentoUsuario || '',
        'documentoCliente': this.dataPaquete[0]?.documentoCliente || '',
        'idEstado': this.dataPaquete[0]?.idEstado || '',
      });

    });
    this.getUsuarioPaquete();
    this.getClientePaquete();
    this.getEstadoPaquete();
  }

  postForm(id: any) {
    this.api.putPaquete(id).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if (respuesta.status == 'ok') {
        this.alerts.showSuccess('El paquete ha sido modificado exitosamente.', 'Modificación Exitosa');
        this.router.navigate(['list-paquetes']);
      }
      else {
        this.alerts.showError(respuesta.msj, "Error en la Modificación");
      }
    })
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

  goBack() {
    this.router.navigate(['list-paquetes']);
  }
}