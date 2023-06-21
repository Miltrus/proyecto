import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { TipoDocumentoInterface } from '../../../models/tipo-documento.interface';
import { UsuarioInterface } from '../../../models/usuario.interface';
import { UsuarioService } from '../../../services/api/usuario/usuario.service';
import { EstadoUsuarioInterface } from '../../../models/estado-usuario.interface';
import { RolInterface } from '../../../models/rol.interface';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from '../../../models/response.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-edit-usuario',
  templateUrl: './edit-usuario.component.html',
  styleUrls: ['./edit-usuario.component.scss']
})
export class EditUsuarioComponent implements OnInit {

  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private api: UsuarioService,
    private alerts: AlertsService,
    private dialog: MatDialog,
  ) { }

  editForm = new FormGroup({
    documentoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
    idTipoDocumento: new FormControl('', Validators.required),
    nombreUsuario: new FormControl('', Validators.required),
    apellidoUsuario: new FormControl('', Validators.required),
    telefonoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]), // Agregamos la validación de patrón usando Validators.pattern
    correoUsuario: new FormControl('', [Validators.required, Validators.email]),
    contrasenaUsuario: new FormControl('', [Validators.pattern(/^(?=.*[A-Z])(?=.*\d.*\d.*\d)(?=.*[!@#$%^&+=*]).{8,}$/i)]),
    idRol: new FormControl('', Validators.required),
    idEstado: new FormControl(''),
  })

  dataUsuario: UsuarioInterface[] = [];
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
    let documentoUsuario = this.activatedRouter.snapshot.paramMap.get('id');

    this.api.getOneUsuario(documentoUsuario).subscribe(data => {
      this.dataUsuario = data ? [data] : []; //si data encontró algun valor, lo asignamos a dataRol envuelto en un arreglo, si data es null asignamos un arreglo vacio, si no se hace esto da error
      this.editForm.setValue({
        'documentoUsuario': this.dataUsuario[0]?.documentoUsuario || 'documentoUsuario',
        'idTipoDocumento': this.dataUsuario[0]?.idTipoDocumento || '',
        'nombreUsuario': this.dataUsuario[0]?.nombreUsuario || '',
        'apellidoUsuario': this.dataUsuario[0]?.apellidoUsuario || '',
        'telefonoUsuario': this.dataUsuario[0]?.telefonoUsuario || '',
        'correoUsuario': this.dataUsuario[0]?.correoUsuario || '',
        'contrasenaUsuario': this.dataUsuario[0]?.contrasenaUsuario || '',
        'idRol': this.dataUsuario[0]?.idRol || '',
        'idEstado': this.dataUsuario[0]?.idEstado || '',
      });
      this.loading = false;
    });
    this.getTiposDocumento();
    this.getEstadosUsuario();
    this.getRolesUsuario();
  }


  postForm(id: any) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Estás seguro que deseas editar este usuario?'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.api.putUsuario(id).subscribe(data => {
          let respuesta: ResponseInterface = data;
          if (respuesta.status == 'ok') {
            this.alerts.showSuccess('El usuario ha sido modificado exitosamente', 'Modificacion exitosa');
            this.router.navigate(['usuario/list-usuarios']);

          } else {
            this.alerts.showError(respuesta.msj, 'Error al modificar el usuario');
            this.loading = false;
          }
        });
      } else {
        this.alerts.showInfo('El usuario no ha sido modificado', 'Modificacion cancelada');
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