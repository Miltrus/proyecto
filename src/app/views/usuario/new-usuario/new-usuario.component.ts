import { Component, HostListener, OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../services/api/usuario.service';
import { UsuarioInterface } from '../../../models/usuario.interface';
import { ResponseInterface } from '../../../models/response.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { EstadoUsuarioInterface } from 'src/app/models/estado-usuario.interface';
import { RolInterface } from 'src/app/models/rol.interface';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';
import { Subscription, forkJoin, tap } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-usuario',
  templateUrl: './new-usuario.component.html',
  styleUrls: ['./new-usuario.component.scss']
})
export class NewUsuarioComponent implements OnInit, OnDestroy, HasUnsavedChanges {

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges()) {
      e.returnValue = '';
    }
  }

  constructor(
    private router: Router,
    private api: UsuarioService,
  ) { }

  private subscriptions: Subscription = new Subscription();
  tiposDocumento: TipoDocumentoInterface[] = []
  estadosUsuario: EstadoUsuarioInterface[] = [];
  rolUsuario: RolInterface[] = [];
  loading: boolean = true;

  hasUnsavedChanges(): boolean {
    this.loading = false;
    return this.newForm.dirty;
  }

  newForm = new FormGroup({
    idUsuario: new FormControl(''),
    documentoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]),
    idTipoDocumento: new FormControl('', Validators.required),
    nombreUsuario: new FormControl('', Validators.required),
    apellidoUsuario: new FormControl('', Validators.required),
    telefonoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]), // Agregamos la validación de patrón usando Validators.pattern
    correoUsuario: new FormControl('', [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    contrasenaUsuario: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d.*\d.*\d)(?=.*[!@#$%^&+=?.:,"°~;_¿¡*/{}|<>()]).{8,}$/)]),
    idRol: new FormControl('', Validators.required),
    idEstado: new FormControl('1'),
  })


  ngOnInit(): void {
    this.loading = true;

    const forkJoinSub = forkJoin([
      this.api.getTipoDocumento(),
      this.api.getEstadoUsuario(),
      this.api.getRolUsuario()
    ]).pipe(
      tap(([tiposDocumento, estadosUsuario, rolesUsuario]) => {
        this.tiposDocumento = tiposDocumento;
        this.estadosUsuario = estadosUsuario;
        this.rolUsuario = rolesUsuario;
      })
    ).subscribe(() => {
      this.loading = false;
    });
    this.subscriptions.add(forkJoinSub);
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this.subscriptions.unsubscribe();
  }

  postForm(form: UsuarioInterface) {
    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro de que deseas crear este usuario?',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        const postUserSub = this.api.postUsuario(form).subscribe(data => {
          let respuesta: ResponseInterface = data;
          if (respuesta.status == 'ok') {
            this.router.navigate(['usuario/list-usuarios']);
            this.newForm.reset();
            Swal.fire({
              icon: 'success',
              title: 'Usuario creado',
              text: 'El usuario ha sido creado exitosamente.',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al crear',
              text: respuesta.msj,
            });
            this.loading = false;
          }
        });
        this.subscriptions.add(postUserSub);
      }
    });
  }


  goBack() {
    this.router.navigate(['usuario/list-usuarios']);
    this.loading = true;
  }

  showPassword: boolean = false;
  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }
}