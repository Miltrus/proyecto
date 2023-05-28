import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { PermisoService } from '../../../services/api/permiso/permiso.service';
import { PermisoInterface } from '../../../models/permiso.interface';
import { ModuloInterface } from '../../../models/modulo.interface';
import { ModuloService } from '../../../services/api/modulo/modulo.service';
import { ResponseInterface } from '../../../models/response.interface';

@Component({
  selector: 'app-new-permiso',
  templateUrl: './new-permiso.component.html',
  styleUrls: ['./new-permiso.component.scss']
})
export class NewPermisoComponent implements OnInit{

  constructor(private router:Router, private api:PermisoService, private alerts:AlertsService, private moduloService: ModuloService) { }

  newForm = new FormGroup({
    idPermiso: new FormControl(''),
    nombrePermiso: new FormControl(''),
    idModulo: new FormControl(''),
  })

  modulos: ModuloInterface[] = [];

  ngOnInit(): void {
    this.checkLocalStorage();
    this.getModulos();
  }

  checkLocalStorage() {
    if(!localStorage.getItem('token')){
      this.router.navigate(['login']);
    }
  }

  postForm(form: PermisoInterface){
    this.api.postPermiso(form).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if(respuesta.status == 'ok'){
        this.alerts.showSuccess('El permiso ha sido creado exitosamente.', 'Permiso creado');
        this.router.navigate(['list-permisos']);
      }
      else{
        this.alerts.showError(respuesta.msj, 'Error al crear el permiso');
      }
    });
  }

  getModulos(): void {
    this.moduloService.getAllModulos().subscribe(
      (data: ModuloInterface[]) => {
        this.modulos = data;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  goBack(){
    this.router.navigate(['list-permisos']);
  }
}