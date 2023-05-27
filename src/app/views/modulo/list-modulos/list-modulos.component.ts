import { Component, OnInit} from '@angular/core';
import { ModuloService } from '../../../services/api/modulo/modulo.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { ModuloInterface } from 'src/app/models/modulo.interface';


@Component({
  selector: 'app-list-modulos',
  templateUrl: './list-modulos.component.html',
  styleUrls: ['./list-modulos.component.css']
})
export class ListModulosComponent implements OnInit{

  constructor(private api:ModuloService, private router:Router, private alerts:AlertsService) {  }

  modulos: ModuloInterface[] = [];

  ngOnInit(): void {
    this.api.getAllModulos().subscribe(data => {
      this.modulos = data;
    })
  }

  editModulo(id:any){
    this.router.navigate(['edit-modulo', id]);
  }

  newModulo(){
    this.router.navigate(['new-modulo']);
  }

  deleteModulo(id: any): void {
    if (confirm('¿Estás seguro de que deseas eliminar este modulo?')) {
      
      this.api.deleteModulo(id).subscribe(data => {
      let respuesta: ResponseInterface = data;

      if(respuesta.status == 'ok'){
        this.alerts.showSuccess('El modulo ha sido eliminado exitosamente.', 'Eliminación Exitosa');
        window.location.reload();
      }else{
        this.alerts.showError('No se pudo eliminar el modulo.', 'Error al eliminar');
      }
      });
    }
  }

  goBack(){
    this.router.navigate(['dashboard']);
  }
}