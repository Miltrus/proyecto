import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ClienteService } from '../../../services/api/cliente/cliente.service';
import { ClienteInterface } from '../../../models/cliente.interface';
import { ResponseInterface } from '../../../models/response.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { LoginComponent } from 'src/app/components/login/login.component';

@Component({
  selector: 'app-new-cliente',
  templateUrl: './new-cliente.component.html',
  styleUrls: ['./new-cliente.component.scss']
})
export class NewClienteComponent implements OnInit{

  constructor(private router:Router, private api:ClienteService, private alerts:AlertsService, private auth:LoginComponent) { }

  newForm = new FormGroup({
    documentoCliente: new FormControl(''),
    idTipoDocumento: new FormControl(''),
    nombreCliente: new FormControl(''),
    telefonoCliente: new FormControl(''),
    correoCliente: new FormControl(''),
    direccionCliente: new FormControl(''),
  })

  tiposDocumento: TipoDocumentoInterface[] = []
  
  ngOnInit(): void {
    this.auth.checkLocalStorage();
    this.getTiposDocumento();
  }

  postForm(form: ClienteInterface){
    this.api.postCliente(form).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if(respuesta.status == 'ok'){
        this.alerts.showSuccess('El cliente ha sido creado exitosamente.', 'Cliente creado');
        this.router.navigate(['cliente/list-clientes']);
      }
      else{
        this.alerts.showError(respuesta.msj, 'Error al crear el cliente');
      }
    });
  }

  getTiposDocumento(): void {
    this.api.getTipoDocumento().subscribe(
      (data: TipoDocumentoInterface[]) => {
        this.tiposDocumento = data;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  goBack(){
    this.router.navigate(['cliente/list-clientes']);
  }
}