import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginService } from '../../services/api/login/login.service';
import { LoginInterface } from '../../models/login.interface';
import { ResolveData, Router } from '@angular/router';
import { ResponseInterface } from '../../models/response.interface';
import { AlertsService } from '../../services/alerts/alerts.service';
import { UsuarioInterface } from 'src/app/models/usuario.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm = new FormGroup({
    correoUsuario: new FormControl('', Validators.required),
    contrasenaUsuario: new FormControl('', Validators.required)
  })

  constructor(private api: LoginService, private router: Router, private alerts: AlertsService) { }

  loading = false;
  userData: UsuarioInterface | null = null;


  ngOnInit(): void {

  }


  onLogin(form: LoginInterface) {
    this.api.onLogin(form).subscribe(data => {
      let dataResponse: ResponseInterface = data;
      if (dataResponse.status == 'ok') {
        this.loading = true;
        setTimeout(() => {
          this.alerts.showSuccess('Inicio de sesión exitoso', 'Bienvenido');
          localStorage.setItem("idRol", dataResponse.user.idRol);
          localStorage.setItem("token", dataResponse.token);
          this.userData = dataResponse.user; // Almacenar los datos del usuario
          console.log(this.userData);
          
          this.router.navigate(['dashboard']);
          this.loading = false;
        }, 500);
        return true;
      } else {
        this.alerts.showError(dataResponse.msj, 'Error al iniciar sesión');
        return false;
      }
    });
  }

  goBack() {
    this.router.navigate(['landing-page']);
  }
}