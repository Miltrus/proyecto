import { Injectable } from '@angular/core';
import { ResponseInterface } from '../../../models/response.interface';
import { PaqueteInterface } from '../../../models/paquete.interface';
import { UsuarioInterface } from '../../../models/usuario.interface';
import { ClienteInterface } from '../../../models/cliente.interface';
import { EstadoPaqueteInterface } from 'src/app/models/estado-paquete.interface';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'; // 

@Injectable({
  providedIn: 'root'
})
export class PaqueteService {

  url: string = 'http://localhost:3030/';

  constructor(private http: HttpClient) { }

  getAllPaquetes(): Observable<PaqueteInterface[]> {
    let address = this.url + 'paquete';
    return this.http.get<PaqueteInterface[]>(address);
  }

  getOnePaquete(id: any): Observable<PaqueteInterface> {
    let address = this.url + 'paquete/' + id;
    return this.http.get<PaqueteInterface>(address);
  }

  postPaquete(form: PaqueteInterface): Observable<ResponseInterface> {
    let address = this.url + 'paquete';
    return this.http.post<ResponseInterface>(address, form);
  }

  putPaquete(id: any): Observable<ResponseInterface> {
    let address = this.url + 'paquete/' + id;
    return this.http.put<ResponseInterface>(address, id);
  }

  deletePaquete(id: any): Observable<ResponseInterface> {
    let addres = this.url + 'paquete/' + id;
    return this.http.delete<ResponseInterface>(addres);
  }

  getUsuario(): Observable<UsuarioInterface[]> {
    const address = this.url + 'usuario';
    return this.http.get<UsuarioInterface[]>(address);
  }

  getCliente(): Observable<ClienteInterface[]> {
    const address = this.url + 'cliente';
    return this.http.get<ClienteInterface[]>(address);
  }

  getEstadoPaquete(): Observable<EstadoPaqueteInterface[]> {
    const address = this.url + 'estadoPaquete';
    return this.http.get<EstadoPaqueteInterface[]>(address);
  }

  getNombreCliente(idCliente: any): Observable<any> {
    const address = this.url + 'paquete/' + idCliente + '/nombre';
    return this.http.get<any>(address);
  }

  getTelefonoCliente(idCliente: any): Observable<any> {
    const address = this.url + 'paquete/' + idCliente + '/telefono';
    return this.http.get<any>(address);
  }

  getDireccionCliente(idCliente: any): Observable<any> {
    const address = this.url + 'paquete/' + idCliente + '/direccion';
    return this.http.get<any>(address);
  }

  getCorreoCliente(idCliente: any): Observable<any> {
    const address = this.url + 'paquete/' + idCliente + '/correo';
    return this.http.get<any>(address);
  }

}
