import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RolInterface } from '../../../models/rol.interface';
import { RolService } from '../../../services/api/rol/rol.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from '../../../models/response.interface';
import { LoginComponent } from 'src/app/components/login/login.component';

@Component({
  selector: 'app-edit-rol',
  templateUrl: './edit-rol.component.html',
  styleUrls: ['./edit-rol.component.scss']
})
export class EditRolComponent implements OnInit{

  constructor(
    private router:Router, 
    private activatedRouter:ActivatedRoute, 
    private api:RolService, 
    private alerts:AlertsService,
    private auth: LoginComponent,
    ) { }

  dataRol: RolInterface[] = [];
  editForm = new FormGroup({
    idRol: new FormControl(''),
    nombreRol: new FormControl(''),
    descripcionRol: new FormControl(''),
  })

  ngOnInit(): void {
    this.auth.checkLocalStorage();

    let idRol = this.activatedRouter.snapshot.paramMap.get('id');
    this.api.getOneRol(idRol).subscribe(data => {
      this.dataRol = data ? [data] : []; //si data encontró algun valor, lo asignamos a dataRol envuelto en un arreglo, si data es null asignamos un arreglo vacio, si no se hace esto da error
      this.editForm.setValue({
        'idRol': this.dataRol[0]?.idRol || 'idRol',
        'nombreRol': this.dataRol[0]?.nombreRol || '',
        'descripcionRol': this.dataRol[0]?.descripcionRol || '',
      });
    })
  }

  postForm(id: any){
    this.api.putRol(id).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if(respuesta.status == 'ok'){
        this.alerts.showSuccess('El rol ha sido modificado exitosamente.', 'Modificación Exitosa');
        this.router.navigate(['list-roles']);
      }
      else{
        this.alerts.showError(respuesta.msj, "Error en la Modificación");
      }
    })
  }

  goBack(){
    this.router.navigate(['list-roles']);
  }
}