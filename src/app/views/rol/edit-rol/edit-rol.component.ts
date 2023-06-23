import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RolInterface } from '../../../models/rol.interface';
import { RolService } from '../../../services/api/rol/rol.service';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from '../../../models/response.interface';
import { PermisoInterface } from 'src/app/models/permiso.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-edit-rol',
  templateUrl: './edit-rol.component.html',
  styleUrls: ['./edit-rol.component.scss']
})
export class EditRolComponent implements OnInit {

  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private api: RolService,
    private alerts: AlertsService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
  ) { }

  dataRol: RolInterface[] = [];
  permisos: PermisoInterface[] = []; // Nueva propiedad para almacenar los permisos asociados al rol
  permisosSeleccionados: string[] = []; // Nueva propiedad para almacenar los permisos seleccionados
  loading: boolean = true;

  selectListar = false;
  selectCrear = false;
  selectEditar = false;
  selectEliminar = false;

  // ...

  updateCheckboxes(nombrePermiso: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.checked;

    this.permisosSeleccionados = [];

    this.permisosSeleccionadosFormArray.controls.forEach((control, index) => {
      const permiso = this.permisos[index];
      if (permiso?.nombrePermiso?.startsWith(nombrePermiso)) {
        control.patchValue(value);
        if (value) {
          this.permisosSeleccionados.push(permiso.nombrePermiso);
        }
      }
    });
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
  }

  get permisosSeleccionadosFormArray() {
    return this.editForm.get('permisosSeleccionados') as FormArray;
  }

  postForm(id: any) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Está seguro que deseas modificar este rol?',
      }
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        //const permisosSeleccionados = this.permisosSeleccionadosFormArray.value;
        this.api.putRol(id).subscribe(data => {
          let respuesta: ResponseInterface = data;
          if (respuesta.status == 'ok') {
            this.alerts.showSuccess('El rol ha sido modificado', 'Modificación exitosa');
            this.router.navigate(['rol/list-roles']);
          }
          else {
            this.alerts.showError(respuesta.msj, "Error en la modificación");
            this.loading = false;
          }
        });
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
