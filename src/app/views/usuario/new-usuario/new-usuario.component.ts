import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
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
    documentoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
    idTipoDocumento: new FormControl('', [Validators.required]),
    nombreUsuario: new FormControl('', [Validators.required]),
    apellidoUsuario: new FormControl('', [Validators.required]),
    telefonoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]), // Agregamos la validación de patrón usando Validators.pattern
    correoUsuario: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')]),
    contrasenaUsuario: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d.*\d.*\d)(?=.*[!@#$%^&+=*]).{8,}$/i)]),
    idRol: new FormControl('', [Validators.required]),
    idEstado: new FormControl('1'),
  })

  tiposDocumento: TipoDocumentoInterface[] = []
  estadosUsuario: EstadoUsuarioInterface[] = [];
  rolUsuario: RolInterface[] = [];
  loading: boolean = true;

  showPassword: boolean = false;

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }


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


  validarContrasena(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const regexMayuscula = /^(?=.*[A-Z])/;
      const regexNumeros = /^(?=.*\d.*\d.*\d)/;
      const regexCaracterEspecial = /^(?=.*[@#$%^&+=])/;
      const regexLongitud = /^.{8,}$/;

      if (
        regexMayuscula.test(control.value) &&
        regexNumeros.test(control.value) &&
        regexCaracterEspecial.test(control.value) &&
        regexLongitud.test(control.value)
      ) {
        return null; // La contraseña cumple todos los requisitos
      } else {
        return { 'contrasenaInvalida': true };
      }
    };
  }


}
