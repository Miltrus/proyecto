import { Component, OnInit, ViewChild} from '@angular/core';
import { ModuloService } from '../../../services/api/modulo/modulo.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { ModuloInterface } from 'src/app/models/modulo.interface';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';


@Component({
  selector: 'app-list-modulos',
  templateUrl: './list-modulos.component.html',
  styleUrls: ['./list-modulos.component.scss']
})
export class ListModulosComponent implements OnInit{

  constructor(private api:ModuloService, private router:Router, private alerts:AlertsService) {  }

  modulos: ModuloInterface[] = [];
  dataSource = new MatTableDataSource(this.modulos);

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento

  ngOnInit(): void {
    this.checkLocalStorage();
    
    this.api.getAllModulos().subscribe(data => { 
      this.modulos = data;
      this.dataSource.data = this.modulos; //actualizamos el datasource ya que inicialmente contiene el arreglo vacio de clientes
    });
  }

  ngAfterViewInit() { //para la paginacion y el ordenamiento
    this.dataSource.paginator = this.paginator; 
    this.dataSource.sort = this.sort;
  }

  checkLocalStorage() {
    if(!localStorage.getItem('token')){
      this.router.navigate(['login']);
    }
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  goBack(){
    this.router.navigate(['dashboard']);
  }
}