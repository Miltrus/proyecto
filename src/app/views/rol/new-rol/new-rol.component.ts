import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { RolService } from '../../../services/api/rol/rol.service';
import { RolInterface } from '../../../models/rol.interface';
import { ResponseInterface } from '../../../models/response.interface';
import { PermisoInterface } from 'src/app/models/permiso.interface';
import { RolPermisoInterface } from 'src/app/models/rol-permiso.interface';
import { LoginComponent } from 'src/app/components/login/login.component';

@Component({
  selector: 'app-new-rol',
  templateUrl: './new-rol.component.html',
  styleUrls: ['./new-rol.component.scss']
})
export class NewRolComponent implements OnInit {

  constructor(private router: Router, private api: RolService, private alerts: AlertsService, private auth: LoginComponent) { }

  newForm = new FormGroup({
    nombreRol: new FormControl(''),
    descripcionRol: new FormControl(''),
    permisosSeleccionados: new FormArray(<any>[])
  });

  permisos: PermisoInterface[] = [];

  ngOnInit(): void {
    this.auth.checkLocalStorage();
    this.getPermisos();
  }

  getPermisos(): void {
    this.api.getAllPermisos().subscribe(data => {
      this.permisos = data;
      this.permisos.forEach(() => {
        const control = new FormControl(false);
        (this.newForm.controls.permisosSeleccionados as FormArray<any>).push(control);
      });
    });
  }
  
  

  postForm(form: RolInterface) {
    this.api.postRol(form).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if (respuesta.status == 'ok') {
        this.alerts.showSuccess('El rol ha sido creado exitosamente.', 'Rol Creado');
        this.router.navigate(['list-roles']);
  
        // Obtén el último ID de rol creado
        this.api.getLastRolId().subscribe(lastRolId => {
          const idRol = lastRolId;
  
          console.log(idRol);
          // Obtén los permisos seleccionados del formulario
          const permisosSeleccionados = this.newForm.value.permisosSeleccionados;
  
          console.log(permisosSeleccionados);
          // Itera sobre los permisos seleccionados y guárdalos en la tabla intermedia
          permisosSeleccionados.forEach((permisoSeleccionado: boolean, index: number) => {
            if (permisoSeleccionado) {
              const permisoId = this.permisos[index].idPermiso;
              const rolPermiso: RolPermisoInterface = {
                idRol: idRol,
                idPermiso: permisoId
              };
  
              // Llama al método de la API para guardar el registro en la tabla intermedia
              this.api.guardarRolPermiso(rolPermiso).subscribe(response => {
                // Maneja la respuesta si es necesario
              });
  
              console.log(rolPermiso);
            }
          });
        });
  
      } else {
        this.alerts.showError(respuesta.msj, 'Error al crear el rol');
      }
    });
  }
  
  
  

  goBack() {
    this.router.navigate(['list-roles']);
  }

}
