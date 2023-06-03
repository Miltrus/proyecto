import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ModuloService } from '../../../services/api/modulo/modulo.service';
import { ModuloInterface } from '../../../models/modulo.interface';
import { ResponseInterface } from '../../../models/response.interface';
import { LoginComponent } from 'src/app/components/login/login.component';

@Component({
  selector: 'app-new-modulo',
  templateUrl: './new-modulo.component.html',
  styleUrls: ['./new-modulo.component.scss']
})
export class NewModuloComponent implements OnInit{

  constructor(private router:Router, private api:ModuloService, private alerts:AlertsService, private auth: LoginComponent) { }

  newForm = new FormGroup({
    idModulo: new FormControl(''),
    modulo: new FormControl(''),
  })

  ngOnInit(): void {
    this.auth.checkLocalStorage();
  }

  postForm(form: ModuloInterface){
    this.api.postModulo(form).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if(respuesta.status == 'ok'){
        this.alerts.showSuccess('El modulo ha sido creado exitosamente.', 'Modulo creado');
        this.router.navigate(['list-modulos']);
      }
      else{
        this.alerts.showError(respuesta.msj, 'Error al crear el modulo');
      }
    });
  }

  goBack(){
    this.router.navigate(['list-modulos']);
  }
}