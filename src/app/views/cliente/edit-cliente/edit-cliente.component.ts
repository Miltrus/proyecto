import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { TipoDocumentoInterface } from '../../../models/tipo-documento.interface';
import { ClienteInterface } from '../../../models/cliente.interface';
import { ClienteService } from '../../../services/api/cliente/cliente.service';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from '../../../models/response.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-edit-cliente',
  templateUrl: './edit-cliente.component.html',
  styleUrls: ['./edit-cliente.component.scss']
})
export class EditClienteComponent implements OnInit {

  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private api: ClienteService,
    private alerts: AlertsService,
    private dialog: MatDialog,
  ) { }

  dataCliente: ClienteInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = [];
  loading: boolean = true;

  editForm = new FormGroup({
    documentoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
    idTipoDocumento: new FormControl('', Validators.required),
    nombreCliente: new FormControl('', Validators.required),
    telefonoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]), // Agregamos la validación de patrón usando Validators.pattern
    correoCliente: new FormControl('', [Validators.required, Validators.email]),
    direccionCliente: new FormControl('', Validators.required),
  })

  ngOnInit(): void {
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
      this.loading = false;
    })
    this.getTiposDocumento();
  }

  postForm(id: any) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Está seguro que deseas modificar este cliente?',
      }
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.api.putCliente(id).subscribe(data => {
          let respuesta: ResponseInterface = data;
          if (respuesta.status == 'ok') {
            this.alerts.showSuccess('El cliente ha sido modificado', 'Modificación exitosa');
            this.router.navigate(['cliente/list-clientes']);
          }
          else {
            this.alerts.showError(respuesta.msj, "Error en la modificación");
            this.loading = false;
          }
        });
      } else {
        this.alerts.showInfo('No se ha modificado el cliente', 'Modificación cancelada');
      }
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