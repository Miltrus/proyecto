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

  async openForgotPasswordDialog(event: Event) {
    event.preventDefault();
    await Swal.fire({
      title: 'Recuperar contraseña',
      html: `
        <label for="swal-input1">Documento de identidad</label>
        <input id="swal-input1" class="swal2-input" placeholder="Ingrese su documento">
        <label for="swal-input2">Correo electronico</label>
        <input id="swal-input2" class="swal2-input" placeholder="Ingrese su email">
      `,
      showCloseButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Recuperar',
      preConfirm: () => {
        return {
          documentoUsuario: (document.getElementById('swal-input1') as HTMLInputElement).value,
          correoUsuario: (document.getElementById('swal-input2') as HTMLInputElement).value
        };
      },
    }).then((result) => {
      this.loading = true;
      if (result.isConfirmed) {
        try {
          this.api.onForgotPassword(result.value).subscribe(data => {
            Swal.fire({
              icon: data.status == 'ok' ? 'success' : 'error',
              title: data.status == 'ok' ? 'Recuperacion exitosa' : 'Error',
              text: data.status == 'ok' ? data.msj : data.msj,
            });
            this.loading = false;
          });
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ha ocurrido un error al intentar recuperar la contraseña, por favor intente nuevamente.',
          });
          this.loading = false;
        }
      };
    });
  }

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