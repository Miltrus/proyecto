import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { LoginService } from 'src/app/services/api/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-pwd',
  templateUrl: './forgot-pwd.component.html',
  styleUrls: ['./forgot-pwd.component.scss']
})
export class ForgotPwdComponent {

  constructor(
    private auth: LoginService,
    public dialogRef: MatDialogRef<ForgotPwdComponent>
  ) { }

  loading: boolean = false;

  forgotForm = new FormGroup({
    documentoUsuario: new FormControl('', [Validators.required]),
    correoUsuario: new FormControl('', [Validators.required]),
  })

  forgotPwd(form: any) {
    this.loading = true;
    this.auth.onForgotPassword(form).subscribe(data => {
      this.loading = false;
      Swal.fire({
        icon: data.status == 'ok' ? 'success' : 'error',
        title: data.status == 'ok' ? 'Revisa tu correo' : 'Error',
        text: data.msj,
      }).then(() => {
        if (data.status == 'ok') {
          this.dialogRef.close();
        }
      });
    });
  }
}