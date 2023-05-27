import { Injectable } from '@angular/core';
import { ResponseInterface } from '../../../models/response.interface';
import { ClienteInterface } from '../../../models/cliente.interface';
import { TipoDocumentoInterface } from '../../../models/tipo-documento.interface';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'; // 

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  url:string = 'http://localhost:3030/';

  constructor(private http:HttpClient) { }

  getAllClientes():Observable<ClienteInterface[]>{
    let address = this.url + 'cliente';
    return this.http.get<ClienteInterface[]>(address);
  }

  getOneCliente(id: any):Observable<ClienteInterface>{
    let address = this.url + 'cliente/' + id;
    return this.http.get<ClienteInterface>(address);
  }

  postCliente(form: ClienteInterface):Observable<ResponseInterface>{
    let address = this.url + 'cliente';
    return this.http.post<ResponseInterface>(address, form);
  }

  putCliente(id: any):Observable<ResponseInterface>{
    let address = this.url + 'cliente/' + id;
    return this.http.put<ResponseInterface>(address, id);
  }

  deleteCliente(id: any):Observable<ResponseInterface>{
    let addres = this.url + 'cliente/' + id;
    return this.http.delete<ResponseInterface>(addres);
  }

  getTipoDocumento(): Observable<TipoDocumentoInterface[]> {
    const address = this.url + 'tipodocumentocliente';
    return this.http.get<TipoDocumentoInterface[]>(address);
  }
}
