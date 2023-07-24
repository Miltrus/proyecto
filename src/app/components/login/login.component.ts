import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginService } from '../../services/api/login.service';
import { LoginInterface } from '../../models/login.interface';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

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
    private http: HttpClient
  ) { }

  loading = false;
  showPassword: boolean = false;
  dataUser: any = [];

  async openForgotPasswordDialog() {
    const { value: formValues } = await Swal.fire({
      title: 'Recuperar contraseña',
      html:
        '<label for="swal-input1">Correo electrónico:</label>' +
        '<input id="swal-input1" class="swal2-input" placeholder="Ingrese su correo electrónico">' +
        '<label for="swal-input2">Documento de identidad:</label>' +
        '<input id="swal-input2" class="swal2-input" placeholder="Ingrese su documento de identidad">',
      customClass: {
        input: 'swal2-input-lg',
      },
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement).value,
          (document.getElementById('swal-input2') as HTMLInputElement).value
        ];
      }
    });

    if (formValues && formValues[0] !== '' && formValues[1] !== '') {
      const email = formValues[0];
      const documento = formValues[1];

      try {
        // Llama a la API para recuperar la contraseña
        const response = await this.http.post<any>('http://localhost:3030/auth/forgot-pwd', {
          correoUsuario: email,
          documentoUsuario: documento
        }).toPromise();

        // Mostrar SweetAlert con el mensaje de la API
        Swal.fire({
          icon: response.status === 'ok' ? 'success' : 'error',
          title: response.status === 'ok' ? 'Correo enviado exitosamente' : 'Error',
          text: response.msj
        });

      } catch (error) {
        console.log('Error en la llamada a la API:', error);
        // Si ocurre algún error en la llamada a la API
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error en la llamada a la API'
        });
      }
    }
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