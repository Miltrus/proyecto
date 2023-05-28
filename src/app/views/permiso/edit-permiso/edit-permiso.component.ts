import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModuloInterface } from '../../../models/modulo.interface';
import { ModuloService } from '../../../services/api/modulo/modulo.service';
import { PermisoInterface } from '../../../models/permiso.interface';
import { PermisoService } from '../../../services/api/permiso/permiso.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from '../../../models/response.interface';

@Component({
  selector: 'app-edit-rol',
  templateUrl: './edit-permiso.component.html',
  styleUrls: ['./edit-permiso.component.scss']
})
export class EditPermisoComponent implements OnInit{

  constructor(private router:Router, private activatedRouter:ActivatedRoute, private api:PermisoService, private moduloService: ModuloService, private alerts:AlertsService) { }

  dataPermiso: PermisoInterface[] = [];
  editForm = new FormGroup({
    idPermiso: new FormControl(''),
    nombrePermiso: new FormControl(''),
    idModulo: new FormControl(''),
  })

  modulos: ModuloInterface[] = [];

  ngOnInit(): void {
    let idPermiso = this.activatedRouter.snapshot.paramMap.get('id');
    this.api.getOnePermiso(idPermiso).subscribe(data => {
      this.dataPermiso = data ? [data] : []; //si data encontró algun valor, lo asignamos a dataRol envuelto en un arreglo, si data es null asignamos un arreglo vacio, si no se hace esto da error
      this.editForm.setValue({
        'idPermiso': this.dataPermiso[0]?.idPermiso || 'idRol',
        'nombrePermiso': this.dataPermiso[0]?.nombrePermiso || '',
        'idModulo': this.dataPermiso[0]?.idModulo || '',
      });
    })
    this.checkLocalStorage();
    this.getModulos();
  }

  checkLocalStorage() {
    if(!localStorage.getItem('token')){
      this.router.navigate(['login']);
    }
  }
  postForm(id: any){
    this.api.putPermiso(id).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if(respuesta.status == 'ok'){
        this.alerts.showSuccess('El permiso ha sido modificado exitosamente.', 'Modificación Exitosa');
        this.router.navigate(['list-permisos']);
      }
      else{
        this.alerts.showError(respuesta.msj, "Error en la Modificación");
      }
    })
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