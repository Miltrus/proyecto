import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginService } from '../../services/api/login.service';
import { LoginInterface } from '../../models/login.interface';
import { ResolveData, Router } from '@angular/router';
import { AlertsService } from '../../services/alerts/alerts.service';
import { UsuarioInterface } from 'src/app/models/usuario.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm = new FormGroup({
    correoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    contrasenaUsuario: new FormControl('', Validators.required)
  })

  constructor(private api: LoginService, private router: Router, private alerts: AlertsService) { }

  loading = false;
  userData: UsuarioInterface | null = null;
  showPassword: boolean = false;


  ngOnInit(): void {

  }


  onLogin(form: LoginInterface) {
    this.loading = true;
    this.api.onLogin(form).subscribe(data => {
      if (data.status == 'ok') {
        this.loading = true;
        localStorage.setItem("token", data.token);
        this.userData = data.user; // Almacenar los datos del usuario
        this.router.navigate(['dashboard']);
        this.alerts.showSuccess('Inicio de sesión exitoso', 'Bienvenido');
        return true;
      } else {
        this.alerts.showError(data.msj, 'Error al iniciar sesión');
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