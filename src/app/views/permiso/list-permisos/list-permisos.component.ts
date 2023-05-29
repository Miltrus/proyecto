import { Component, OnInit, ViewChild} from '@angular/core';
import { PermisoService } from '../../../services/api/permiso/permiso.service';
import { ModuloService } from '../../../services/api/modulo/modulo.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { PermisoInterface } from 'src/app/models/permiso.interface';
import { ModuloInterface } from 'src/app/models/modulo.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';


@Component({
  selector: 'app-list-permisos',
  templateUrl: './list-permisos.component.html',
  styleUrls: ['./list-permisos.component.scss']
})
export class ListPermisosComponent implements OnInit{

  constructor(private api:PermisoService, private router:Router, private alerts:AlertsService, private moduloService:ModuloService) {  }

  permisos: PermisoInterface[] = [];
  modulos: ModuloInterface[] = [];
  dataSource = new MatTableDataSource(this.permisos);

  @ViewChild(MatPaginator) paginator!: MatPaginator; //para la paginacion, y los del ! pal not null
  @ViewChild(MatSort) sort!: MatSort; //para el ordenamiento

  ngOnInit(): void {
    this.checkLocalStorage();
    
    this.api.getAllPermisos().subscribe(data => { 
      this.permisos = data;
      this.dataSource.data = this.permisos; //actualizamos el datasource ya que inicialmente contiene el arreglo vacio de clientes
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  

  goBack(){
    this.router.navigate(['dashboard']);
  }
}