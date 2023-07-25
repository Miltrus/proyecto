import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/api/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-pwd',
  templateUrl: './new-pwd.component.html',
  styleUrls: ['./new-pwd.component.scss']
})
export class NewPwdComponent {

  newPwd = new FormGroup({
    contrasenaUsuario: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d.*\d.*\d)(?=.*[!@#$%^&+=?.:,"°~;_¿¡*/{}|<>()]).{8,}$/)]),
    repetirContrasena: new FormControl('', [Validators.required]),
  })

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    // Suscribirse a los cambios en el campo 'contrasenaUsuario'
    this.newPwd.get('contrasenaUsuario')?.valueChanges.subscribe(() => {
      this.passwordMatchValidator();
    });

    // Suscribirse a los cambios en el campo 'repetirContrasena'
    this.newPwd.get('repetirContrasena')?.valueChanges.subscribe(() => {
      this.passwordMatchValidator();
    });
  }


  loading = false;
  showPassword: boolean = false;

  passwordMatchValidator() {
    const newPassword = this.newPwd.get('contrasenaUsuario')?.value;
    const confirmPassword = this.newPwd.get('repetirContrasena')?.value;

    if (newPassword === confirmPassword) {
      this.newPwd.get('repetirContrasena')?.setErrors(null);
    } else {
      this.newPwd.get('repetirContrasena')?.setErrors({ passwordMismatch: true });
    }
  }

  onNewPwd() {
    this.loading = true;
    const newPwd = this.newPwd.get('contrasenaUsuario')?.value;
    const token = this.route.snapshot.paramMap.get('token');
    this.auth.onNewPwd({ newPwd, token }).subscribe(data => {
      this.loading = false;
      Swal.fire({
        icon: data.status === 'ok' ? 'success' : 'error',
        title: data.status === 'ok' ? '¡Contraseña actualizada!' : 'Error',
        text: data.msj,
      }).then(() => {
        if (data.status === 'ok') {
          this.router.navigate(['auth/login']);
        }
      });
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
