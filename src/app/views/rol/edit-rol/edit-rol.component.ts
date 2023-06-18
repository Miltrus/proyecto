import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RolInterface } from '../../../models/rol.interface';
import { RolService } from '../../../services/api/rol/rol.service';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
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
  ) { }

  dataRol: RolInterface[] = [];
  permisos: PermisoInterface[] = []; // Nueva propiedad para almacenar los permisos asociados al rol
  loading: boolean = true;

  editForm = new FormGroup({
    idRol: new FormControl(''),
    nombreRol: new FormControl('', Validators.required),
    descripcionRol: new FormControl(''),
    permisos: new FormArray([]) // FormArray para los permisos
  });

  ngOnInit(): void {
    let idRol = this.activatedRouter.snapshot.paramMap.get('id');
    this.api.getOneRol(idRol).subscribe(data => {
      this.dataRol = data ? [data] : [];
      this.editForm.patchValue({
        idRol: this.dataRol[0]?.idRol || '',
        nombreRol: this.dataRol[0]?.nombreRol || '',
        descripcionRol: this.dataRol[0]?.descripcionRol || ''
      });
      this.loading = false;
    });

    this.api.getAllPermisos().subscribe(data => {
      this.permisos = data;
      // Crear los controles de formulario para los permisos
      this.permisos.forEach(() => {
        (this.editForm.get('permisos') as FormArray).push(new FormControl(false));
      });
    });
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
