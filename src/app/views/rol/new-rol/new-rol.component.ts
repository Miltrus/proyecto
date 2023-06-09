import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { RolService } from '../../../services/api/rol.service';
import { RolInterface } from '../../../models/rol.interface';
import { ResponseInterface } from '../../../models/response.interface';
import { PermisoInterface } from 'src/app/models/permiso.interface';
import { RolPermisoInterface } from 'src/app/models/rol-permiso.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';

@Component({
  selector: 'app-new-rol',
  templateUrl: './new-rol.component.html',
  styleUrls: ['./new-rol.component.scss']
})
export class NewRolComponent implements OnInit, HasUnsavedChanges {

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    return this.hasUnsavedChanges() === false;
  }

  constructor(
    private router: Router,
    private api: RolService,
    private alerts: AlertsService,
    private dialog: MatDialog,
  ) { }

  savedChanges: boolean = false;

  hasUnsavedChanges(): boolean {
    this.loading = false;
    return this.newForm.dirty && !this.savedChanges;
  }

  newForm = new FormGroup({
    nombreRol: new FormControl('', Validators.required),
    permisosSeleccionados: new FormArray(<any>[])
  });

  permisos: PermisoInterface[] = [];
  loading: boolean = true;

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
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Estás seguro que deseas crear este rol?'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const permisosSeleccionados = this.newForm.value.permisosSeleccionados;
        if (permisosSeleccionados.filter((permiso: boolean) => permiso).length < 1) {
          this.alerts.showError('Debes seleccionar al menos un permiso', 'Error');
          return; // Detener la ejecución del método si no se selecciona ningún permiso
        }
        this.loading = true;
        this.api.postRol(form).subscribe(data => {
          this.savedChanges = true;
          let respuesta: ResponseInterface = data;
          if (respuesta.status == 'ok') {
            this.alerts.showSuccess('El rol ha sido creado exitosamente', 'Rol creado');
            this.router.navigate(['rol/list-roles']);

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
            this.alerts.showError(respuesta.msj, 'Error al crear el rol');
            this.loading = false;
          }
        });

      } else {
        this.alerts.showInfo('El rol no ha sido creado', 'Rol no creado');
      }
    });
  }


  goBack() {
    this.loading = true;
    this.router.navigate(['rol/list-roles']);
  }

}