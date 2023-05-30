import { Injectable } from '@angular/core';
import { ResponseInterface } from '../../../models/response.interface';
import { EntregaInterface } from '../../../models/entrega.interface';
import { ListaPaqueteInterface } from '../../../models/lista-paquete.interface';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'; // 

@Injectable({
  providedIn: 'root'
})
export class EntregaService {

  url: string = 'http://localhost:3030/';

  constructor(private http: HttpClient) { }

  getAllEntregas(): Observable<EntregaInterface[]> {
    let address = this.url + 'entrega';
    return this.http.get<EntregaInterface[]>(address);
  }

  getOneEntrega(id: any): Observable<EntregaInterface> {
    let address = this.url + 'entrega/' + id;
    return this.http.get<EntregaInterface>(address);
  }

  postEntrega(form: EntregaInterface): Observable<ResponseInterface> {
    let address = this.url + 'entrega';
    return this.http.post<ResponseInterface>(address, form);
  }

  putEntrega(id: any): Observable<ResponseInterface> {
    let address = this.url + 'entrega/' + id;
    return this.http.put<ResponseInterface>(address, id);
  }

  deleteEntrega(id: any): Observable<ResponseInterface> {
    let addres = this.url + 'entrega/' + id;
    return this.http.delete<ResponseInterface>(addres);
  }

  getListaPaquete(): Observable<ListaPaqueteInterface[]> {
    const address = this.url + 'listapaquete';
    return this.http.get<ListaPaqueteInterface[]>(address);
  }
}
