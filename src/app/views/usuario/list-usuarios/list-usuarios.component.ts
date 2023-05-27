import { Component, OnInit} from '@angular/core';
import { UsuarioService } from '../../../services/api/usuario/usuario.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { UsuarioInterface } from 'src/app/models/usuario.interface';
import { TipoDocumentoInterface } from 'src/app/models/tipo-documento.interface';
import { EstadoUsuarioInterface } from 'src/app/models/estado-usuario.interface';
import { RolInterface } from 'src/app/models/rol.interface';


@Component({
  selector: 'app-list-clientes',
  templateUrl: './list-usuarios.component.html',
  styleUrls: ['./list-usuarios.component.scss']
})
export class ListUsuariosComponent implements OnInit{

  constructor(private api:UsuarioService, private router:Router, private alerts:AlertsService) {  }

  usuarios: UsuarioInterface[] = [];
  tiposDocumento: TipoDocumentoInterface[] = [];
  estadosUsuario: EstadoUsuarioInterface[] = [];
  rolUsuario: RolInterface[] = [];

  ngOnInit(): void {
    this.api.getAllUsuarios().subscribe(data => {
      this.usuarios = data;
    });

    this.api.getTipoDocumento().subscribe(data => {
      this.tiposDocumento = data;
    });

    this.api.getEstadoUsuario().subscribe(data => {
      this.estadosUsuario = data;
    });
    
    this.api.getRolUsuario().subscribe(data => {
      this.rolUsuario = data;
    });
  }

  editUsuario(id:any){
    this.router.navigate(['edit-usuario', id]);
  }

  newUsuario(){
    this.router.navigate(['new-usuario']);
  }

  deleteUsuario(id: any): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      
      this.api.deleteUsuario(id).subscribe(data => {
      let respuesta: ResponseInterface = data;

      if(respuesta.status == 'ok'){
        this.alerts.showSuccess('El usuario ha sido eliminado exitosamente.', 'Eliminación Exitosa');
        window.location.reload();
      }else{
        this.alerts.showError(respuesta.msj, 'Error en la Eliminación');
      }
      });
    }
  }

  getTipoDocumento(idTipoDocumento: any): string {
    const tipoDocumento = this.tiposDocumento.find(tipo => tipo.idTipoDocumento === idTipoDocumento);
    return tipoDocumento?.nombreTipo || '';
  }
  
  getEstadoUsuario(idEstado: any): string {
    const estadoUsuario = this.estadosUsuario.find(estado => estado.idEstado === idEstado);
    return estadoUsuario?.estadoUsuario || '';
  }

  getRolUsuario(idRol: any): string {
    const rolUsuario = this.rolUsuario.find(rol => rol.idRol === idRol);
    return rolUsuario?.nombreRol || '';
  }
  
  goBack(){
    this.router.navigate(['dashboard']);
  }
}