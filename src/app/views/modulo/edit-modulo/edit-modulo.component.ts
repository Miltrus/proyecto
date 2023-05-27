import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModuloInterface } from '../../../models/modulo.interface';
import { ModuloService } from '../../../services/api/modulo/modulo.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from '../../../models/response.interface';

@Component({
  selector: 'app-edit-modulo',
  templateUrl: './edit-modulo.component.html',
  styleUrls: ['./edit-modulo.component.css']
})
export class EditModuloComponent implements OnInit{

  constructor(private router:Router, private activatedRouter:ActivatedRoute, private api:ModuloService, private alerts:AlertsService) { }

  dataModulo: ModuloInterface[] = [];
  editForm = new FormGroup({
    idModulo: new FormControl(''),
    modulo: new FormControl(''),
  })

  ngOnInit(): void {
    let idModulo = this.activatedRouter.snapshot.paramMap.get('id');
    let token = this.getToken();
    this.api.getOneModulo(idModulo).subscribe(data => {
      this.dataModulo = data ? [data] : []; //si data encontró algun valor, lo asignamos a dataRol envuelto en un arreglo, si data es null asignamos un arreglo vacio, si no se hace esto da error
      this.editForm.setValue({
        'idModulo': this.dataModulo[0]?.idModulo || 'idModulo',
        'modulo': this.dataModulo[0]?.modulo || '',
      });
      console.log(this.editForm.value);
      
    })
  }

  getToken(){
    return localStorage.getItem('token');
  }

  postForm(id: any){
    this.api.putModulo(id).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if(respuesta.status == 'ok'){
        this.alerts.showSuccess('El modulo ha sido modificado exitosamente.', 'Modificación exitosa');
        this.router.navigate(['list-modulos']);
      }
      else{
        this.alerts.showError(respuesta.msj, "Error en la modificación");
      }
    })
  }

  goBack(){
    this.router.navigate(['list-modulos']);
  }
}