import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { UsuarioService } from '../../../services/api/usuario/usuario.service';
import { UsuarioInterface } from '../../../models/usuario.interface';
import { ResponseInterface } from '../../../models/response.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { EstadoUsuarioInterface } from 'src/app/models/estado-usuario.interface';
import { RolInterface } from 'src/app/models/rol.interface';

@Component({
  selector: 'app-new-usuario',
  templateUrl: './new-usuario.component.html',
  styleUrls: ['./new-usuario.component.scss']
})
export class NewUsuarioComponent implements OnInit {

  constructor(private router: Router, private api: UsuarioService, private alerts: AlertsService) { }

  newForm = new FormGroup({
    documentoUsuario: new FormControl(''),
    idTipoDocumento: new FormControl(''),
    nombreUsuario: new FormControl(''),
    apellidoUsuario: new FormControl(''),
    telefonoUsuario: new FormControl(''),
    correoUsuario: new FormControl(''),
    contrasenaUsuario: new FormControl(''),
    idRol: new FormControl(''),
    idEstado: new FormControl('1'),
  })

  tiposDocumento: TipoDocumentoInterface[] = []
  estadosUsuario: EstadoUsuarioInterface[] = [];
  rolUsuario: RolInterface[] = [];
  loading: boolean = true;

  ngOnInit(): void {
    this.getTiposDocumento();
    this.getEstadosUsuario();
    this.getRolesUsuario();
  }

  postForm(form: UsuarioInterface) {
    this.loading = true;
    this.api.postUsuario(form).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if (respuesta.status == 'ok') {
        this.alerts.showSuccess('El usuario ha sido creado exitosamente.', 'Usuario creado');
        this.router.navigate(['usuario/list-usuarios']);
      }
      else {
        this.alerts.showError(respuesta.msj, 'Error al crear el usuario');
      }
      this.loading = false;
    });
  }

  getTiposDocumento(): void {
    this.api.getTipoDocumento().subscribe(data => {
      this.tiposDocumento = data;
      this.loading = false;
    });
  }

  getEstadosUsuario(): void {
    this.api.getEstadoUsuario().subscribe(data => {
      this.estadosUsuario = data;
      this.loading = false;
    });
  }

  getRolesUsuario(): void {
    this.api.getRolUsuario().subscribe(data => {
      this.rolUsuario = data;
      this.loading = false;
    });
  }

  goBack() {
    this.loading = true;
    this.router.navigate(['usuario/list-usuarios']);
  }
}