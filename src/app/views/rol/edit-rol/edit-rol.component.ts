import { Component, HostListener, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RolInterface } from '../../../models/rol.interface';
import { RolService } from '../../../services/api/rol.service';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from '../../../models/response.interface';
import { PermisoInterface } from 'src/app/models/permiso.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';
import { RolPermisoInterface } from 'src/app/models/rol-permiso.interface';
import { HasUnsavedChanges } from 'src/app/auth/guards/unsaved-changes.guard';

@Component({
  selector: 'app-edit-rol',
  templateUrl: './edit-rol.component.html',
  styleUrls: ['./edit-rol.component.scss']
})
export class EditRolComponent implements OnInit, HasUnsavedChanges {

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    return this.hasUnsavedChanges() === false;
  }

  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private api: RolService,
    private alerts: AlertsService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
  ) { }

  dataRol: RolInterface[] = [];
  permisos: PermisoInterface[] = []; // pa almacenar los permisos asociados al rol
  permisosSeleccionados: string[] = []; // pa almacenar los permisos seleccionados
  loading: boolean = true;

  hasUnsavedChanges(): boolean {
    this.loading = false;
    return this.editForm.dirty;
  }


  updateAllCheckboxes(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.checked;

    this.permisosSeleccionados = [];

    this.permisosSeleccionadosFormArray.controls.forEach((control, index) => {
      control.patchValue(value);
      const permiso = this.permisos[index];
      if (value) {
        this.permisosSeleccionados.push(permiso.nombrePermiso);
      }
    });
  }


  editForm = new FormGroup({
    idRol: new FormControl(''),
    nombreRol: new FormControl('', Validators.required),
    permisosSeleccionados: new FormArray(<any>[])
  });

  ngOnInit(): void {
    let idRol = this.activatedRouter.snapshot.paramMap.get('id');
    this.api.getOneRol(idRol).subscribe(data => {
      this.dataRol = data ? [data] : [];
      this.editForm.patchValue({
        idRol: this.dataRol[0]?.idRol || 'idRol',
        nombreRol: this.dataRol[0]?.nombreRol || '',
      });
      this.loading = false;
    });

    this.api.getAllPermisos().subscribe((data) => {
      this.permisos = data;
      this.permisos.forEach(() => {
        this.permisosSeleccionadosFormArray.push(this.formBuilder.control(false));
      });
      this.loading = false;
    });

    // Obtener los permisos asociados al rol y marcar los checkboxes correspondientes
    this.api.getRolPermisos(idRol).subscribe(data => {
      this.loading = true;
      const permisos: PermisoInterface[] = data.idPermiso
        ? data.idPermiso.filter((rolPermiso: RolPermisoInterface | null | undefined) => rolPermiso !== null && rolPermiso !== undefined)
          .map((rolPermiso: RolPermisoInterface) => rolPermiso.permiso!)
        : [];

      this.permisosSeleccionados = permisos.map((permiso: PermisoInterface) => permiso.nombrePermiso);

      this.permisosSeleccionadosFormArray.controls.forEach((control, index) => {
        const permiso = this.permisos[index];
        control.setValue(this.permisosSeleccionados.includes(permiso.nombrePermiso));
      });
      this.loading = false;
    });
  }


  get permisosSeleccionadosFormArray() {
    return this.editForm.get('permisosSeleccionados') as FormArray;
  }

  postForm(id: any) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Estás seguro que deseas modificar este rol?',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;

        if (id.idRol === 1 || id.idRol === 2) {
          this.alerts.showError('No se puede modificar este rol', 'Error en la modificación');
          this.loading = false;
        } else {
          this.api.putRol(id).subscribe(data => {
            // Obtén los permisos seleccionados
            if (data.idRol === 1 || data.idRol === 2) {
              this.alerts.showError('No se puede modificar este rol', 'Error en la modificación');
              return;
            }
            const nuevosPermisos = this.permisosSeleccionadosFormArray.controls
              .map((control, index) => control.value ? this.permisos[index].idPermiso : null)
              .filter(permiso => permiso !== null);
            this.api.putRolPermiso(id.idRol, nuevosPermisos).subscribe(data => {
              let respuesta: ResponseInterface = data;
              if (respuesta.status == 'ok') {
                this.editForm.reset();
                this.alerts.showSuccess('El rol ha sido modificado', 'Modificación exitosa');
                this.router.navigate(['rol/list-roles']);
              } else {
                this.alerts.showError(respuesta.msj, "Error en la modificación");
                this.loading = false;
              }
            });
          });

        }

      } else {
        this.alerts.showInfo('No se ha modificado el rol', 'Modificación cancelada');
      }
    });
  }



  goBack() {
    this.loading = true;
    this.router.navigate(['rol/list-roles']);
  }
}
