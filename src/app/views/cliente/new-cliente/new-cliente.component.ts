import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ClienteService } from '../../../services/api/cliente/cliente.service';
import { ClienteInterface } from '../../../models/cliente.interface';
import { ResponseInterface } from '../../../models/response.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';

@Component({
  selector: 'app-new-cliente',
  templateUrl: './new-cliente.component.html',
  styleUrls: ['./new-cliente.component.scss']
})
export class NewClienteComponent implements OnInit {

  constructor(private router: Router, private api: ClienteService, private alerts: AlertsService) { }

  newForm = new FormGroup({
    documentoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
    idTipoDocumento: new FormControl('', Validators.required),
    nombreCliente: new FormControl('', Validators.required),
    telefonoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]), // Agregamos la validación de patrón usando Validators.pattern
    correoCliente: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')]),
    direccionCliente: new FormControl('', Validators.required),
  })

  tiposDocumento: TipoDocumentoInterface[] = []
  loading: boolean = true;

  ngOnInit(): void {
    this.getTiposDocumento();
  }


  postForm(form: ClienteInterface) {
    this.loading = true;
    this.api.postCliente(form).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if (respuesta.status == 'ok') {
        this.alerts.showSuccess('El cliente ha sido creado exitosamente', 'Cliente creado');
        this.router.navigate(['cliente/list-clientes']);
      }
      else {
        this.alerts.showError(respuesta.msj, 'Error al crear el cliente');
      }
      this.loading = false;
    });
  }


  getTiposDocumento(): void {
    this.api.getTipoDocumento().subscribe(data => {
      this.tiposDocumento = data;
      this.loading = false;
    });
  }




  goBack() {
    this.loading = true;
    this.router.navigate(['cliente/list-clientes']);
  }
}