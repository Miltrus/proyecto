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
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-new-usuario',
  templateUrl: './new-usuario.component.html',
  styleUrls: ['./new-usuario.component.scss']
})
export class NewUsuarioComponent implements OnInit {

  constructor(
    private router: Router,
    private api: UsuarioService,
    private alerts: AlertsService,
    private dialog: MatDialog,
  ) { }

  newForm = new FormGroup({
    documentoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
    idTipoDocumento: new FormControl('', [Validators.required]),
    nombreUsuario: new FormControl('', [Validators.required]),
    apellidoUsuario: new FormControl('', [Validators.required]),
    telefonoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]), // Agregamos la validación de patrón usando Validators.pattern
    correoUsuario: new FormControl('', [Validators.required, Validators.email]),
    contrasenaUsuario: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d.*\d.*\d)(?=.*[!@#$%^&+=*]).{8,}$/)]),
    idRol: new FormControl('', [Validators.required]),
    idEstado: new FormControl('1'),
  })

  tiposDocumento: TipoDocumentoInterface[] = []
  estadosUsuario: EstadoUsuarioInterface[] = [];
  rolUsuario: RolInterface[] = [];
  loading: boolean = true;

  token = localStorage.getItem('token');
  decodedToken = JSON.parse(atob(this.token!.split('.')[1]));
  uid = this.decodedToken.uid;

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
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Estás seguro que deseas crear este usuario?'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;

        this.api.getOneUsuario(this.uid).subscribe(data => {
          if (data.idRol == '1') {
            this.api.postUsuario(form).subscribe(data => {
              let respuesta: ResponseInterface = data;
              if (respuesta.status == 'ok') {
                this.alerts.showSuccess('El usuario ha sido creado exitosamente', 'Usuario creado');
                this.router.navigate(['usuario/list-usuarios']);

              } else {
                this.alerts.showError(respuesta.msj, 'Error al crear el usuario');
                this.loading = false;
              }
            });
          } else {
            this.alerts.showError('No tienes permisos para realizar esta acción', 'Error');
            this.loading = false;
          }
        });

      } else {
        this.alerts.showInfo('El usuario no ha sido creado', 'Usuario no creado');
      }
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