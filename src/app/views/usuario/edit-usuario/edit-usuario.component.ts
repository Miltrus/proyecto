import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { TipoDocumentoInterface } from '../../../models/tipo-documento.interface';
import { UsuarioInterface } from '../../../models/usuario.interface';
import { UsuarioService } from '../../../services/api/usuario/usuario.service';
import { EstadoUsuarioInterface } from '../../../models/estado-usuario.interface';
import { RolInterface } from '../../../models/rol.interface';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from '../../../models/response.interface';
import { LoginComponent } from 'src/app/components/login/login.component';

@Component({
  selector: 'app-edit-usuario',
  templateUrl: './edit-usuario.component.html',
  styleUrls: ['./edit-usuario.component.scss']
})
export class EditUsuarioComponent implements OnInit{

  constructor(
    private router:Router, 
    private activatedRouter:ActivatedRoute, 
    private api:UsuarioService, 
    private alerts:AlertsService,
    private auth: LoginComponent,
    ) { }

  editForm = new FormGroup({
    documentoUsuario: new FormControl(''),
    idTipoDocumento: new FormControl(''),
    nombreUsuario: new FormControl(''),
    apellidoUsuario: new FormControl(''),
    telefonoUsuario: new FormControl(''),
    correoUsuario: new FormControl(''),
    contrasenaUsuario: new FormControl(''),
    idRol: new FormControl(''),
    idEstado: new FormControl(''),
  })

  dataUsuario : UsuarioInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = []
  estadosUsuario: EstadoUsuarioInterface[] = [];
  rolUsuario: RolInterface[] = [];

  ngOnInit(): void {
    this.auth.checkLocalStorage();

    let documentoUsuario = this.activatedRouter.snapshot.paramMap.get('id');
    this.api.getOneUsuario(documentoUsuario).subscribe(data => {
      this.dataUsuario = data ? [data] : []; //si data encontró algun valor, lo asignamos a dataRol envuelto en un arreglo, si data es null asignamos un arreglo vacio, si no se hace esto da error
      this.editForm.setValue({
        'documentoUsuario': this.dataUsuario[0]?.documentoUsuario || 'documentoUsuario',
        'idTipoDocumento': this.dataUsuario[0]?.idTipoDocumento || '',
        'nombreUsuario': this.dataUsuario[0]?.nombreUsuario || '',
        'apellidoUsuario': this.dataUsuario[0]?.apellidoUsuario || '',
        'telefonoUsuario': this.dataUsuario[0]?.telefonoUsuario || '',
        'correoUsuario': this.dataUsuario[0]?.correoUsuario || '',
        'contrasenaUsuario': this.dataUsuario[0]?.contrasenaUsuario || '',
        'idRol': this.dataUsuario[0]?.idRol || '',
        'idEstado': this.dataUsuario[0]?.idEstado || '',
      });
    });
    this.getTiposDocumento();
    this.getEstadosUsuario();
    this.getRolesUsuario();
  }

  postForm(id: any){
    this.api.putUsuario(id).subscribe(data => {
      let respuesta: ResponseInterface = data;
      if(respuesta.status == 'ok'){
        this.alerts.showSuccess('El usuario ha sido modificado exitosamente.', 'Modificación Exitosa');
        this.router.navigate(['usuario/list-usuarios']);
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

  getEstadosUsuario(): void {
    this.api.getEstadoUsuario().subscribe(
      (data: EstadoUsuarioInterface[]) => {
        this.estadosUsuario = data;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getRolesUsuario(): void {
    this.api.getRolUsuario().subscribe(
      (data: RolInterface[]) => {
        this.rolUsuario = data;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  goBack(){
    this.router.navigate(['usuario/list-usuarios']);
  }
}