import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/api/auth.service';
import { LoginInterface } from '../../models/login.interface';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ForgotPwdComponent } from '../forgot-pwd/forgot-pwd.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm = new FormGroup({
    correoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    contrasenaUsuario: new FormControl('', Validators.required)
  })

  constructor(
    private auth: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) { }

  loading = false;
  showPassword: boolean = false;
  dataUser: any = [];
  showForgotPwd: boolean = false;

  async openForgotPasswordDialog(event: Event) {
    event.preventDefault();
    this.dialog.open(ForgotPwdComponent, {
      width: '400px',
      height: 'auto',
    });
  };

  onLogin(form: LoginInterface) {
    this.loading = true;
    this.auth.onLogin(form).subscribe(async (data) => {
      if (data.status == 'ok') {
        this.loading = true;
        localStorage.setItem("token", data.token);
        await this.router.navigate(['dashboard']);
        this.dataUser = data.user;
        this._snackBar.open(`Bienvenido, ${this.dataUser.nombreUsuario}`, undefined, {
          duration: 3500,
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.msj,
        })
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goBack() {
    this.router.navigate(['landing-page']);
  }
}