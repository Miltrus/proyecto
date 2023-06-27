import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UsuarioInterface } from '../../../models/usuario.interface';
import { UsuarioService } from 'src/app/services/api/usuario/usuario.service';
import { RolInterface } from 'src/app/models/rol.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';
import { AlertsService } from 'src/app/services/alerts/alerts.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  editForm!: FormGroup; // el signo de exclamación "!" para indicar que será inicializada posteriormente
  pwdForm!: FormGroup;
  rolUsuario: RolInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = [];
  loading: boolean = true;

  showPasswordChange: boolean = false;
  showPassword: boolean = false;

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  togglePasswordChange() {
    this.showPasswordChange = !this.showPasswordChange;
  }


  constructor(
    private dialogRef: MatDialogRef<EditProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userData: UsuarioInterface },
    private formBuilder: FormBuilder,
    private userService: UsuarioService,
    private dialog: MatDialog,
    private alerts: AlertsService,
  ) { }

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
    console.log(this.data.userData.idUsuario);
  }

  initializeForm(): void {
    this.editForm = this.formBuilder.group({
      idUsuario: [this.data.userData.idUsuario],
      documentoUsuario: [this.data.userData.documentoUsuario, [Validators.required, Validators.pattern('^[0-9]+$')]],
      idTipoDocumento: [this.data.userData.idTipoDocumento, Validators.required],
      nombreUsuario: [this.data.userData.nombreUsuario, Validators.required],
      apellidoUsuario: [this.data.userData.apellidoUsuario, Validators.required],
      telefonoUsuario: [this.data.userData.telefonoUsuario, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      correoUsuario: [this.data.userData.correoUsuario, [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      idRol: [this.data.userData.idRol, Validators.required],
    });
    this.pwdForm = this.formBuilder.group({
      contrasenaUsuario: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d.*\d.*\d)(?=.*[!@#$%^&+=*]).{8,}$/)]],
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
            this.alerts.showSuccess('Cambios guardados exitosamente', 'Usuario actualizado');
            this.dialogRef.close(updatedData);
          } else {
            this.alerts.showError(data.msj, 'Error');
          }
          this.loading = false;
        });
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
