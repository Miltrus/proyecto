import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginService } from '../../services/api/login.service';
import { LoginInterface } from '../../models/login.interface';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
    private api: LoginService,
    private router: Router,
  ) { }

  loading = false;
  showPassword: boolean = false;
  dataUser: any = [];

  onLogin(form: LoginInterface) {
    this.loading = true;
    this.api.onLogin(form).subscribe(data => {
      if (data.status == 'ok') {
        this.loading = true;
        localStorage.setItem("token", data.token);
        this.router.navigate(['dashboard']);
        this.dataUser = data.user;
        Swal.fire({
          icon: 'success',
          title: 'Inicio de sesión exitoso',
          text: "¡Bienvenido " + this.dataUser.nombreUsuario + "!",
        })
        return true;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.msj,
        })
        this.loading = false;
        return false;
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