import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RolInterface } from '../../../models/rol.interface';
import { RolService } from '../../../services/api/rol/rol.service';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from '../../../models/response.interface';
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
  ) { }

  dataRol: RolInterface[] = [];
  permisos: PermisoInterface[] = [];

  editForm = new FormGroup({
    idRol: new FormControl(''),
    nombreRol: new FormControl(''),
    descripcionRol: new FormControl(''),
  })

  ngOnInit(): void {

    let idRol = this.activatedRouter.snapshot.paramMap.get('id');
    this.api.getOneRol(idRol).subscribe(data => {
      this.dataRol = data ? [data] : [];
      this.editForm.patchValue({
        idRol: this.dataRol[0]?.idRol || '',
        nombreRol: this.dataRol[0]?.nombreRol || '',
        descripcionRol: this.dataRol[0]?.descripcionRol || ''
      });
    });
  }

  postForm(id: any) {
    this.api.putRol(id).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if (respuesta.status == 'ok') {
        this.alerts.showSuccess('El rol ha sido editado exitosamente.', 'Edición de Rol');
        this.router.navigate(['rol/list-roles']);
      } else {
        this.alerts.showError(respuesta.msj, 'Error al editar el rol');
      }
    });
  }

  goBack(){
    this.router.navigate(['rol/list-roles']);
  }
}
