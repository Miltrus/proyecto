import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginService } from '../../services/api/login/login.service';
import { LoginInterface } from '../../models/login.interface';
import { ResolveData, Router } from '@angular/router';
import { ResponseInterface } from '../../models/response.interface';
import { AlertsService } from '../../services/alerts/alerts.service';

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

  ngOnInit(): void {

  }


  onLogin(form: LoginInterface) {
    this.api.onLogin(form).subscribe(data => {
      let dataResponse: ResponseInterface = data;
      if (dataResponse.status == 'ok') {
        this.loading = true;
        setTimeout(() => {
          this.alerts.showSuccess('Inicio de sesión exitoso', 'Bienvenido');
          localStorage.setItem("token", dataResponse.token);
          this.router.navigate(['dashboard']);
          this.loading = false;
        }, 500);
      }
      else {
        this.alerts.showError(dataResponse.msj, 'Error al iniciar sesión');
      }
    });
  }

  checkLocalStorage() {
    let token = localStorage.getItem('token');
    if (!token) {
      this.alerts.showError('Por favor inicie sesión nuevamente', 'Su sesión ha expirado');
      this.router.navigate(['login']);
    } else {
      const tokenDate = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(tokenDate.exp * 1000);
  
      if (expirationDate < new Date()) {
        localStorage.removeItem('token');
        this.alerts.showError('Por favor inicie sesión nuevamente', 'Su sesión ha expirado');
        this.router.navigate(['login']);
      }
    }
  }
  

  goBack() {
    this.router.navigate(['landing-page']);
  }
}