import { Component, OnInit } from '@angular/core';
import { PaqueteService } from '../../../services/api/paquete/paquete.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { ResponseInterface } from 'src/app/models/response.interface';
import { PaqueteInterface } from 'src/app/models/paquete.interface';
import { UsuarioInterface } from 'src/app/models/usuario.interface';
import { ClienteInterface } from 'src/app/models/cliente.interface';
import { EstadoPaqueteInterface } from 'src/app/models/estado-paquete.interface';

@Component({
  selector: 'app-list-paquetes',
  templateUrl: './list-paquetes.component.html',
  styleUrls: ['./list-paquetes.component.scss']
})
export class ListPaquetesComponent implements OnInit {

  constructor(private api:PaqueteService, private router:Router, private alerts:AlertsService) {  }

  paquetes: PaqueteInterface[] = [];
  usuario: UsuarioInterface[] = [];
  cliente: ClienteInterface[] = [];
  estadosPaquete: EstadoPaqueteInterface[] = [];
  
  ngOnInit(): void {
    this.api.getAllPaquetes().subscribe(data => {
      this.paquetes = data;
    });

    this.api.getUsuario().subscribe(data => {
      this.usuario = data;
    });
    
    this.api.getCliente().subscribe(data => {
      this.cliente = data;
    });

    this.api.getEstadoPaquete().subscribe(data => {
      this.estadosPaquete = data;
    });
  }

  editPaquete(id:any){
    this.router.navigate(['edit-paquete', id]);
  }

  newPaquete(){
    this.router.navigate(['new-paquete']);
  }

  deletePaquete(id: any): void {
    if (confirm('¿Estás seguro de que deseas eliminar este paquete?')) {
      
      this.api.deletePaquete(id).subscribe(data => {
      let respuesta: ResponseInterface = data;

      if(respuesta.status == 'ok'){
        this.alerts.showSuccess('El paquete ha sido eliminado exitosamente.', 'Eliminación Exitosa');
        window.location.reload();
      }else{
        this.alerts.showError('No se pudo eliminar el paquete.', 'Error en la Eliminación');
      }
      });
    }
  }

  getUsuarioPaquete(documentoUsuario: any): string {
    const documento = this.usuario.find(documentoU => documentoU.documentoUsuario === documentoUsuario);
    return documento?.nombreUsuario || '';
  }
  
  
  getClientePaquete( documentoCliente: any): string {
    const cliente = this.cliente.find(documentoC => documentoC.documentoCliente === documentoCliente);
    return cliente?.nombreCliente || '';
  }
  
  getEstadoPaquete(idEstado: any): string {
    const estadoPaquete = this.estadosPaquete.find(estado => estado.idEstado === idEstado);
    return estadoPaquete?.estadoPaquete || '';
  }

  goBack(){
    this.router.navigate(['dashboard']);
  }
}
