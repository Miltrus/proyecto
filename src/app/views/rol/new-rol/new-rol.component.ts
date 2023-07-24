import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { RolService } from '../../../services/api/rol.service';
import { RolInterface } from '../../../models/rol.interface';
import { ResponseInterface } from '../../../models/response.interface';
import { PermisoInterface } from 'src/app/models/permiso.interface';
import { RolPermisoInterface } from 'src/app/models/rol-permiso.interface';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-rol',
  templateUrl: './new-rol.component.html',
  styleUrls: ['./new-rol.component.scss']
})
export class NewRolComponent implements OnInit, HasUnsavedChanges {

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges()) {
      e.returnValue = '';
    }
  }

  constructor(
    private router: Router,
    private api: RolService,
  ) { }

  permisos: PermisoInterface[] = [];
  loading: boolean = true;

  hasUnsavedChanges(): boolean {
    this.loading = false;
    return this.newForm.dirty;
  }

  newForm = new FormGroup({
    nombreRol: new FormControl('', Validators.required),
    permisosSeleccionados: new FormArray(<any>[])
  });


  updateAllCheckboxes(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.checked;

    this.permisosSeleccionadosFormArray.controls.forEach((control) => {
      control.patchValue(value);
    });
  }

  get permisosSeleccionadosFormArray() {
    return this.newForm.get('permisosSeleccionados') as FormArray;
  }

  ngOnInit(): void {
    this.getPermisos();
  }

  getPermisos(): void {
    this.api.getAllPermisos().subscribe(data => {
      this.permisos = data;
      this.permisos.forEach(() => {
        const control = new FormControl(false);
        (this.newForm.controls.permisosSeleccionados as FormArray<any>).push(control);
      });
      this.loading = false;
    });
  }


  postForm(form: RolInterface) {
    Swal.fire({
      icon: 'question',
      title: '¿Estás seguro de que deseas crear este rol?',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        const permisosSeleccionados = this.newForm.value.permisosSeleccionados;
        if (permisosSeleccionados.filter((permiso: boolean) => permiso).length < 1) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debes seleccionar al menos un permiso.',
          });
          return; // Detener la ejecución del método si no se selecciona ningún permiso
        }
        this.loading = true;
        this.api.postRol(form).subscribe(data => {
          let respuesta: ResponseInterface = data;
          if (respuesta.status == 'ok') {
            this.router.navigate(['rol/list-roles']);
            this.newForm.reset();
            Swal.fire({
              icon: 'success',
              title: 'Rol creado',
              text: 'El rol ha sido creado exitosamente.',
            });

            // Obtén el último ID de rol creado
            this.api.getLastRolId().subscribe(lastRolId => {
              const idRol = lastRolId;
              // Obtén los permisos seleccionados del formulario
              const permisosSeleccionados = this.newForm.value.permisosSeleccionados;
              // Itera sobre los permisos seleccionados y guárdalos en la tabla intermedia
              permisosSeleccionados.forEach((permisoSeleccionado: boolean, index: number) => {
                if (permisoSeleccionado) {
                  const permisoId = this.permisos[index].idPermiso;
                  const rolPermiso: RolPermisoInterface = {
                    idRol: idRol,
                    idPermiso: permisoId
                  };

                  // Llama al método de la API para guardar el registro en la tabla intermedia
                  this.api.guardarRolPermiso(rolPermiso).subscribe(data => { });
                }
              });
            });

          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al crear',
              text: respuesta.msj,
            });
          }
          this.loading = false;
        });

      }
    });
  }

  goBack() {
    this.loading = true;
    this.router.navigate(['rol/list-roles']);
  }

}