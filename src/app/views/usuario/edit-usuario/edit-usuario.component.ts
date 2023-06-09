import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { TipoDocumentoInterface } from '../../../models/tipo-documento.interface';
import { UsuarioInterface } from '../../../models/usuario.interface';
import { UsuarioService } from '../../../services/api/usuario.service';
import { EstadoUsuarioInterface } from '../../../models/estado-usuario.interface';
import { RolInterface } from '../../../models/rol.interface';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from '../../../models/response.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';
import { Subscription, forkJoin } from 'rxjs';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';

@Component({
  selector: 'app-edit-usuario',
  templateUrl: './edit-usuario.component.html',
  styleUrls: ['./edit-usuario.component.scss']
})
export class EditUsuarioComponent implements OnInit, HasUnsavedChanges, OnDestroy {

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    return this.hasUnsavedChanges() === false;
  }

  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private api: UsuarioService,
    private alerts: AlertsService,
    private dialog: MatDialog,
  ) { }

  private subscriptions: Subscription = new Subscription();

  savedChanges: boolean = false;

  hasUnsavedChanges(): boolean {
    this.loading = false;
    return (this.editForm.dirty || this.pwdForm.dirty) && !this.savedChanges;
  }

  editForm = new FormGroup({
    idUsuario: new FormControl(''),
    documentoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]),
    idTipoDocumento: new FormControl('', Validators.required),
    nombreUsuario: new FormControl('', Validators.required),
    apellidoUsuario: new FormControl('', Validators.required),
    telefonoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]), // Agregamos la validación de patrón usando Validators.pattern
    correoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    idRol: new FormControl('', Validators.required),
    idEstado: new FormControl(''),
  });

  pwdForm = new FormGroup({
    contrasenaUsuario: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d.*\d.*\d)(?=.*[!@#$%^&+=?.:,"°~;_¿¡*/{}|<>()]).{8,}$/)]),
  })

  dataUsuario: UsuarioInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = []
  estadosUsuario: EstadoUsuarioInterface[] = [];

  rolUsuario: RolInterface[] = [];
  loading: boolean = true;

  showPasswordChange: boolean = false;
  showPassword: boolean = false;


  ngOnInit(): void {
    let idUsuario = this.activatedRouter.snapshot.paramMap.get('id');

    const tipoDocumento$ = this.api.getTipoDocumento();
    const estadoUsuario$ = this.api.getEstadoUsuario();
    const rolUsuario$ = this.api.getRolUsuario();
    const oneUsuario$ = this.api.getOneUsuario(idUsuario);

    this.loading = true;

    const forkJoinSub = forkJoin([tipoDocumento$, estadoUsuario$, rolUsuario$, oneUsuario$]).subscribe(
      ([tipoDocumento, estadoUsuario, rolUsuario, oneUsuario]) => {
        this.tiposDocumento = tipoDocumento;
        this.estadosUsuario = estadoUsuario;
        this.rolUsuario = rolUsuario;

        this.dataUsuario = oneUsuario ? [oneUsuario] : [];

        this.editForm.setValue({
          'idUsuario': this.dataUsuario[0]?.idUsuario || '',
          'documentoUsuario': this.dataUsuario[0]?.documentoUsuario || '',
          'idTipoDocumento': this.dataUsuario[0]?.idTipoDocumento || '',
          'nombreUsuario': this.dataUsuario[0]?.nombreUsuario || '',
          'apellidoUsuario': this.dataUsuario[0]?.apellidoUsuario || '',
          'telefonoUsuario': this.dataUsuario[0]?.telefonoUsuario || '',
          'correoUsuario': this.dataUsuario[0]?.correoUsuario || '',
          'idRol': this.dataUsuario[0]?.idRol || '',
          'idEstado': this.dataUsuario[0]?.idEstado || '',
        });
        this.pwdForm.setValue({
          'contrasenaUsuario': this.dataUsuario[0]?.contrasenaUsuario || '',
        })

        this.loading = false;
      },
      (error) => {
        console.error('Error:', error);
        this.loading = false;
      }
    );
    this.subscriptions.add(forkJoinSub);
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this.subscriptions.unsubscribe();
  }

  postForm(id: any) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Estás seguro que deseas editar este usuario?'
      }
    });
    const dialogRefSub = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        const updatedData: UsuarioInterface = {
          ...this.dataUsuario[0],
          ...this.editForm.value,
        }

        if (this.showPasswordChange) {
          updatedData.contrasenaUsuario = this.pwdForm.value.contrasenaUsuario;
        } else {
          delete updatedData.contrasenaUsuario; // Eliminar la propiedad si el botón "Cambiar contraseña" no está activado
        }

        const putUserSub = this.api.putUsuario(updatedData).subscribe(data => {
          this.savedChanges = true;
          let respuesta: ResponseInterface = data;
          if (respuesta.status == 'ok') {
            this.alerts.showSuccess('El usuario ha sido modificado exitosamente', 'Modificacion exitosa');
            this.router.navigate(['usuario/list-usuarios']);
          } else {
            this.alerts.showError(respuesta.msj, 'Error al modificar el usuario');
            this.loading = false;
          }
        });
        this.subscriptions.add(putUserSub);
      } else {
        this.alerts.showInfo('El usuario no ha sido modificado', 'Modificacion cancelada');
      }
    });
    this.subscriptions.add(dialogRefSub);
  }

  goBack() {
    this.loading = true;
    this.router.navigate(['usuario/list-usuarios']);
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  togglePasswordChange() {
    this.showPasswordChange = !this.showPasswordChange;
  }
}