import { Injectable } from '@angular/core';
import { ResponseInterface } from '../../models/response.interface';
import { NovedadInterface } from '../../models/novedad.interface';
import { TipoNovedadInterface } from '../../models/tipo-novedad.interface';
import { EntregaInterface } from '../../models/entrega.interface';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'; // 


@Injectable({
  providedIn: 'root'
})
export class NovedadService {

  url: string = 'http://localhost:3030/';

  constructor(private http: HttpClient) { }

  getAllNovedades(): Observable<NovedadInterface[]> {
    let address = this.url + 'novedad';
    return this.http.get<NovedadInterface[]>(address);
  }

  getOneNovedad(id: any): Observable<NovedadInterface> {
    let address = this.url + 'novedad/' + id;
    return this.http.get<NovedadInterface>(address);
  }

  postNovedad(form: NovedadInterface): Observable<ResponseInterface> {
    let address = this.url + 'novedad';
    return this.http.post<ResponseInterface>(address, form);
  }

  getTipoNovedad(): Observable<TipoNovedadInterface[]> {
    const address = this.url + 'tipoNovedad';
    return this.http.get<TipoNovedadInterface[]>(address);
  }

  getEntrega(): Observable<EntregaInterface[]> {
    const address = this.url + 'entrega';
    return this.http.get<EntregaInterface[]>(address);
  }
}
