import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UsuarioInterface } from '../../../models/usuario.interface';
import { UsuarioService } from 'src/app/services/api/usuario/usuario.service';
import { RolInterface } from 'src/app/models/rol.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  editForm!: FormGroup; // el signo de exclamación "!" para indicar que será inicializada posteriormente
  rolUsuario: RolInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = [];
  loading: boolean = true;

  showPassword: boolean = false;

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  constructor(
    private dialogRef: MatDialogRef<EditProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userData: UsuarioInterface },
    private formBuilder: FormBuilder,
    private userService: UsuarioService,
    private dialog: MatDialog,
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
  }

  initializeForm(): void {
    this.editForm = this.formBuilder.group({
      documentoUsuario: [this.data.userData.documentoUsuario, [Validators.required, Validators.pattern('^[0-9]+$')]],
      idTipoDocumento: [this.data.userData.idTipoDocumento, Validators.required],
      nombreUsuario: [this.data.userData.nombreUsuario, Validators.required],
      apellidoUsuario: [this.data.userData.apellidoUsuario, Validators.required],
      telefonoUsuario: [this.data.userData.telefonoUsuario, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      correoUsuario: [this.data.userData.correoUsuario, [Validators.required, Validators.email]],
      contrasenaUsuario: [this.data.userData.contrasenaUsuario, [Validators.pattern(/^(?=.*[A-Z])(?=.*\d.*\d.*\d)(?=.*[!@#$%^&+=*]).{8,}$/)]],
      idRol: [this.data.userData.idRol, Validators.required],
    });
  }

  saveChanges(): void {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Está seguro que deseas guardar los cambios?',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.editForm.valid) {
          const updatedData: UsuarioInterface = {
            ...this.data.userData,
            ...this.editForm.value
          };
          this.userService.putUsuario(updatedData).subscribe(() => { });

          this.dialogRef.close(updatedData);
        }
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
