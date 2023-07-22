import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UsuarioInterface } from '../../../models/usuario.interface';
import { UsuarioService } from 'src/app/services/api/usuario.service';
import { RolInterface } from 'src/app/models/rol.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit, HasUnsavedChanges {

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    return this.hasUnsavedChanges() === false;
  }

  editForm!: FormGroup; // el signo de exclamación "!" para indicar que será inicializada posteriormente
  pwdForm!: FormGroup;
  rolUsuario: RolInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = [];
  loading: boolean = true;

  showPasswordChange: boolean = false;
  showPassword: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<EditProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userData: UsuarioInterface },
    private formBuilder: FormBuilder,
    private userService: UsuarioService,
    private dialog: MatDialog,
    private alerts: AlertsService,
  ) { }

  hasUnsavedChanges(): boolean {
    this.loading = false;
    return this.editForm.dirty || (this.showPasswordChange && this.pwdForm.dirty);
  }

  ngOnInit(): void {
    this.userService.getTipoDocumento().subscribe((tiposDocumento) => {
      this.tiposDocumento = tiposDocumento;

      this.loading = false;
    });

    this.userService.getRolUsuario().subscribe((roles) => {
      this.rolUsuario = roles;

      this.loading = false;
    });

    this.initializeForm();
  }

  initializeForm(): void {
    this.editForm = this.formBuilder.group({
      idUsuario: [this.data.userData.idUsuario],
      documentoUsuario: [this.data.userData.documentoUsuario, [Validators.required, Validators.pattern('^[0-9]{7,10}$')]],
      idTipoDocumento: [this.data.userData.idTipoDocumento, Validators.required],
      nombreUsuario: [this.data.userData.nombreUsuario, Validators.required],
      apellidoUsuario: [this.data.userData.apellidoUsuario, Validators.required],
      telefonoUsuario: [this.data.userData.telefonoUsuario, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      correoUsuario: [this.data.userData.correoUsuario, [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      idRol: [this.data.userData.idRol],
    });
    this.pwdForm = this.formBuilder.group({
      contrasenaUsuario: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d.*\d.*\d)(?=.*[!@#$%^&+=?.:,"°~;_¿¡*/{}|<>()]).{8,}$/)]],
    })
  }

  saveChanges(): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Está seguro que deseas guardar los cambios?',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        const updatedData: UsuarioInterface = {
          ...this.data.userData,
          ...this.editForm.value,
        };

        if (this.showPasswordChange) {
          updatedData.contrasenaUsuario = this.pwdForm.value.contrasenaUsuario;
        } else {
          delete updatedData.contrasenaUsuario; // Eliminar la propiedad si el botón "Cambiar contraseña" no está activado
        }

        this.userService.putUsuario(updatedData).subscribe(data => {
          if (data.status == 'ok') {
            this.alerts.showSuccess('Cambios guardados exitosamente.', 'Usuario actualizado');
            this.dialogRef.close(updatedData);
          } else {
            this.alerts.showError(data.msj, 'Error');
          }
          this.loading = false;
        });
      }
    });
  }

  getRolNombre(): string {
    const idRol = this.data.userData.idRol;
    const rol = this.rolUsuario.find((rol) => rol.idRol === idRol);
    return rol ? rol.nombreRol : '';
  }

  closeDialog(): void {
    if (this.editForm.dirty || (this.showPasswordChange && this.pwdForm.dirty)) {
      const dialogRef = this.dialog.open(DialogConfirmComponent, {
        data: {
          title: 'Cambios sin guardar',
          message: '¿Estás seguro que deseas salir?'
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.dialogRef.close();
        }
      });
    } else {
      this.dialogRef.close();
    }
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  togglePasswordChange(event: Event) {
    event.preventDefault();
    this.showPasswordChange = !this.showPasswordChange;
  }
}