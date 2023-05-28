import { Component, OnInit} from '@angular/core';
import { PermisoService } from '../../../services/api/permiso/permiso.service';
import { ModuloService } from '../../../services/api/modulo/modulo.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { PermisoInterface } from 'src/app/models/permiso.interface';
import { ModuloInterface } from 'src/app/models/modulo.interface';


@Component({
  selector: 'app-list-permisos',
  templateUrl: './list-permisos.component.html',
  styleUrls: ['./list-permisos.component.scss']
})
export class ListPermisosComponent implements OnInit{

  constructor(private api:PermisoService, private router:Router, private alerts:AlertsService, private moduloService:ModuloService) {  }

  permisos: PermisoInterface[] = [];
  modulos: ModuloInterface[] = [];

  ngOnInit(): void {
    this.checkLocalStorage();
    this.api.getAllPermisos().subscribe(data => {
      this.permisos = data;
    })
    this.moduloService.getAllModulos().subscribe(data => {
      this.modulos = data;
    });
  }

  checkLocalStorage() {
    if(!localStorage.getItem('token')){
      this.router.navigate(['login']);
    }
  }

  editPermiso(id:any){
    this.router.navigate(['edit-permiso', id]);
  }

  newPermiso(){
    this.router.navigate(['new-permiso']);
  }

  deletePermiso(id: any): void {
    if (confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      
      this.api.deletePermiso(id).subscribe(data => {
      let respuesta: ResponseInterface = data;

      if(respuesta.status == 'ok'){
        this.alerts.showSuccess('El permiso ha sido eliminado exitosamente.', 'Eliminación Exitosa');
        window.location.reload();
      }else{
        this.alerts.showError('No se pudo eliminar el permiso.', 'Error en la Eliminación');
      }
      });
    }
  }

  getNameModulo(idModulo: any): string {
    const modulo = this.modulos.find(modulo => modulo.idModulo === idModulo);
    return modulo?.modulo ?? '';
  }
  

  goBack(){
    this.router.navigate(['dashboard']);
  }
}