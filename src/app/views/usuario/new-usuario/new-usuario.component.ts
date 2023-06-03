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
import { LoginComponent } from 'src/app/components/login/login.component';

@Component({
  selector: 'app-new-usuario',
  templateUrl: './new-usuario.component.html',
  styleUrls: ['./new-usuario.component.scss']
})
export class NewUsuarioComponent implements OnInit{

  constructor(private router:Router, private api:UsuarioService, private alerts:AlertsService, private auth: LoginComponent) { }

  newForm = new FormGroup({
    documentoUsuario: new FormControl(''),
    idTipoDocumento: new FormControl(''),
    nombreUsuario: new FormControl(''),
    apellidoUsuario: new FormControl(''),
    telefonoUsuario: new FormControl(''),
    correoUsuario: new FormControl(''),
    contrasenaUsuario: new FormControl(''),
    idRol: new FormControl(''),
    idEstado: new FormControl(''),
  })

  tiposDocumento: TipoDocumentoInterface[] = []
  estadosUsuario: EstadoUsuarioInterface[] = [];
  rolUsuario: RolInterface[] = [];

  ngOnInit(): void {
    this.auth.checkLocalStorage();
    this.getTiposDocumento();
    this.getEstadosUsuario();
    this.getRolesUsuario();
  }

  postForm(form: UsuarioInterface){
    this.api.postUsuario(form).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if(respuesta.status == 'ok'){
        this.alerts.showSuccess('El usuario ha sido creado exitosamente.', 'Usuario creado');
        this.router.navigate(['list-usuarios']);
      }
      else{
        this.alerts.showError(respuesta.msj, 'Error al crear el usuario');
      }
    });
  }

  getTiposDocumento(): void {
    this.api.getTipoDocumento().subscribe(
      (data: TipoDocumentoInterface[]) => {
        this.tiposDocumento = data;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getEstadosUsuario(): void {
    this.api.getEstadoUsuario().subscribe(
      (data: EstadoUsuarioInterface[]) => {
        this.estadosUsuario = data;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getRolesUsuario(): void {
    this.api.getRolUsuario().subscribe(
      (data: RolInterface[]) => {
        this.rolUsuario = data;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  goBack(){
    this.router.navigate(['list-usuarios']);
  }
}