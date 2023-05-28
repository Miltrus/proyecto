import { Component, OnInit} from '@angular/core';
import { RolService } from '../../../services/api/rol/rol.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { RolInterface } from 'src/app/models/rol.interface';


@Component({
  selector: 'app-list-roles',
  templateUrl: './list-roles.component.html',
  styleUrls: ['./list-roles.component.scss']
})
export class ListRolesComponent implements OnInit{

  constructor(private api:RolService, private router:Router, private alerts:AlertsService) {  }

  roles: RolInterface[] = [];

  ngOnInit(): void {
    this.checkLocalStorage();
    this.api.getAllRoles().subscribe(data => {
      this.roles = data;
    })
  }

  checkLocalStorage() {
    if(!localStorage.getItem('token')){
      this.router.navigate(['login']);
    }
  }

  editRol(id:any){
    this.router.navigate(['edit-rol', id]);
  }

  newRol(){
    this.router.navigate(['new-rol']);
  }

  deleteRol(id: any): void {
    if (confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      
      this.api.deleteRol(id).subscribe(data => {
      let respuesta: ResponseInterface = data;

      if(respuesta.status == 'ok'){
        this.alerts.showSuccess('El rol ha sido eliminado exitosamente.', 'Eliminación Exitosa');
        window.location.reload();
      }else{
        this.alerts.showError('No se pudo eliminar el rol. Inténtalo nuevamente.', 'Error en la Eliminación');
      }
      });
    }
  }

  goBack(){
    this.router.navigate(['dashboard']);
  }
}