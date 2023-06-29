import { Component, Inject } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ClienteService } from '../../../services/api/cliente/cliente.service';
import { ClienteInterface } from '../../../models/cliente.interface';
import { ResponseInterface } from '../../../models/response.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { DialogConfirmComponent } from 'src/app/components/dialog-confirm/dialog-confirm.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-cliente',
  templateUrl: './add-cliente.component.html',
  styleUrls: ['./add-cliente.component.scss']
})
export class AddClienteComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<AddClienteComponent>,
    private router: Router,
    private api: ClienteService,
    private alerts: AlertsService,
    private dialog: MatDialog
  ) { }
  newForm = new FormGroup({
    documentoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
    idTipoDocumento: new FormControl('', Validators.required),
    nombreCliente: new FormControl('', Validators.required),
    telefonoCliente: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]), // Agregamos la validación de patrón usando Validators.pattern
    correoCliente: new FormControl('', [Validators.required, Validators.pattern('^[\\w.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
    direccionCliente: new FormControl('', Validators.required),
  })

  tiposDocumento: TipoDocumentoInterface[] = []
  clientes: ClienteInterface[] = []
  loading: boolean = true;

  ngOnInit(): void {
    this.getTiposDocumento();
  }


  postForm(form: ClienteInterface) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: '¿Estás seguro que deseas crear este cliente?'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.api.postCliente(form).subscribe(data => {
          let respuesta: ResponseInterface = data;
          if (respuesta.status == 'ok') {
            this.alerts.showSuccess('El cliente ha sido creado exitosamente', 'Cliente creado');
            this.dialogRef.close(window.location.reload());
          }
          else {
            this.alerts.showError(respuesta.msj, 'Error al crear el cliente');
            this.loading = false;
          }
        });
      } else {
        this.alerts.showInfo('El cliente no ha sido creado', 'Cliente no creado');
        this.loading = false;
      }
    });
  }


  getTiposDocumento(): void {
    this.api.getTipoDocumento().subscribe(data => {
      this.tiposDocumento = data;
      this.loading = false;
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
