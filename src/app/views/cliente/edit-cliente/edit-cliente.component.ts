import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { TipoDocumentoInterface } from '../../../models/tipo-documento.interface';
import { ClienteInterface } from '../../../models/cliente.interface';
import { ClienteService } from '../../../services/api/cliente/cliente.service';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from '../../../models/response.interface';
import { LoginComponent } from 'src/app/components/login/login.component';

@Component({
  selector: 'app-edit-cliente',
  templateUrl: './edit-cliente.component.html',
  styleUrls: ['./edit-cliente.component.scss']
})
export class EditClienteComponent implements OnInit{

  constructor(
    private router:Router, 
    private activatedRouter:ActivatedRoute, 
    private api:ClienteService,
    private alerts:AlertsService,
    private auth:LoginComponent
  ) { }

  dataCliente: ClienteInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = [];

  editForm = new FormGroup({
    documentoCliente: new FormControl(''),
    idTipoDocumento: new FormControl(''),
    nombreCliente: new FormControl(''),
    telefonoCliente: new FormControl(''),
    correoCliente: new FormControl(''),
    direccionCliente: new FormControl(''),
  })

  ngOnInit(): void {
    this.auth.checkLocalStorage();
    let documentoCliente = this.activatedRouter.snapshot.paramMap.get('id');
    this.api.getOneCliente(documentoCliente).subscribe(data => {
      this.dataCliente = data ? [data] : []; //si data encontró algun valor, lo asignamos a dataRol envuelto en un arreglo, si data es null asignamos un arreglo vacio, si no se hace esto da error
      this.editForm.setValue({
        'documentoCliente': this.dataCliente[0]?.documentoCliente || 'documentoCliente',
        'idTipoDocumento': this.dataCliente[0]?.idTipoDocumento || '',
        'nombreCliente': this.dataCliente[0]?.nombreCliente || '',
        'telefonoCliente': this.dataCliente[0]?.telefonoCliente || '',
        'correoCliente': this.dataCliente[0]?.correoCliente || '',
        'direccionCliente': this.dataCliente[0]?.direccionCliente || '',
      });
    })
    this.getTiposDocumento();
  }

  postForm(id: any){
    this.api.putCliente(id).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if(respuesta.status == 'ok'){
        this.alerts.showSuccess('El cliente ha sido modificado exitosamente.', 'Modificación Exitosa');
        this.router.navigate(['list-clientes']);
      }
      else{
        this.alerts.showError(respuesta.msj, "Error en la Modificación");
      }
    })
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
    this.router.navigate(['list-clientes']);
  }
}