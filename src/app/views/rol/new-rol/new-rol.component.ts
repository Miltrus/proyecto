import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { RolService } from '../../../services/api/rol/rol.service';
import { RolInterface } from '../../../models/rol.interface';
import { ResponseInterface } from '../../../models/response.interface';

@Component({
  selector: 'app-new-rol',
  templateUrl: './new-rol.component.html',
  styleUrls: ['./new-rol.component.scss']
})
export class NewRolComponent implements OnInit{

  constructor(private router:Router, private api:RolService, private alerts:AlertsService) { }

  newForm = new FormGroup({
    idRol: new FormControl(''),
    nombreRol: new FormControl(''),
    descripcionRol: new FormControl(''),
  })

  ngOnInit(): void {
    this.checkLocalStorage();
  }

  checkLocalStorage() {
    if(!localStorage.getItem('token')){
      this.router.navigate(['login']);
    }
  }

  postForm(form: RolInterface){
    this.api.postRol(form).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if(respuesta.status == 'ok'){
        this.alerts.showSuccess('El rol ha sido creado exitosamente.', 'Rol Creado');
        this.router.navigate(['list-roles']);
      }
      else{
        this.alerts.showError(respuesta.msj, 'Error al crear el rol');
      }
    });
  }

  goBack(){
    this.router.navigate(['list-roles']);
  }
}