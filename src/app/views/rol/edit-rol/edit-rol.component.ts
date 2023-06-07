import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RolInterface } from '../../../models/rol.interface';
import { RolService } from '../../../services/api/rol/rol.service';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from '../../../models/response.interface';
import { LoginComponent } from 'src/app/components/login/login.component';
import { RolPermisoInterface } from 'src/app/models/rol-permiso.interface';
import { PermisoInterface } from 'src/app/models/permiso.interface';

@Component({
  selector: 'app-edit-rol',
  templateUrl: './edit-rol.component.html',
  styleUrls: ['./edit-rol.component.scss']
})
export class EditRolComponent implements OnInit{

  constructor(
    private router: Router, 
    private activatedRouter: ActivatedRoute, 
    private api: RolService, 
    private alerts: AlertsService,
    private auth: LoginComponent,
  ) { }

  dataRol: RolInterface[] = [];
  permisos: PermisoInterface[] = [];
  rolesPermisos: RolPermisoInterface[] = [];

  editForm = new FormGroup({
    idRol: new FormControl(''),
    nombreRol: new FormControl(''),
    descripcionRol: new FormControl(''),
    permisosSeleccionados: new FormArray(<any>[])
  })

  ngOnInit(): void {
    this.auth.checkLocalStorage();

    let idRol = this.activatedRouter.snapshot.paramMap.get('id');
    this.api.getOneRol(idRol).subscribe(data => {
      this.dataRol = data ? [data] : [];
      this.editForm.patchValue({
        idRol: this.dataRol[0]?.idRol || '',
        nombreRol: this.dataRol[0]?.nombreRol || '',
        descripcionRol: this.dataRol[0]?.descripcionRol || ''
      });
    });

    this.api.getAllPermisos().subscribe(data => {
      this.permisos = data;
      this.loadPermisosSeleccionados();
    });
  }

  loadPermisosSeleccionados(): void {
    const permisosSeleccionados = this.editForm.controls.permisosSeleccionados as FormArray;
    this.permisos.forEach(() => {
      permisosSeleccionados.push(new FormControl(false));
    });

    this.rolesPermisos[0]?.idPermiso.forEach((permiso: PermisoInterface) => {
      const index = this.permisos.findIndex(p => p.idPermiso === permiso.idPermiso);
      if (index !== -1) {
        permisosSeleccionados.at(index).setValue(true);
      }
    });
  }

  isPermisoSeleccionado(index: number): boolean {
    const permisosSeleccionados = this.editForm.controls.permisosSeleccionados as FormArray;
    return permisosSeleccionados.at(index).value;
  }

  postForm(id: any) {
    this.api.putRol(id).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if (respuesta.status == 'ok') {
        this.alerts.showSuccess('El rol ha sido editado exitosamente.', 'Edición de Rol');
        this.router.navigate(['list-roles']);
      } else {
        this.alerts.showError(respuesta.msj, 'Error al editar el rol');
      }
    });
  }

  goBack(){
    this.router.navigate(['list-roles']);
  }
}
