import { Injectable } from '@angular/core';
import { ResponseInterface } from '../../../models/response.interface';
import { ModuloInterface } from '../../../models/modulo.interface';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'; // 

@Injectable({
  providedIn: 'root'
})
export class ModuloService {

  url:string = 'http://localhost:3030/';

  constructor(private http:HttpClient) { }

  getAllModulos():Observable<ModuloInterface[]>{
    let address = this.url + 'modulo';
    return this.http.get<ModuloInterface[]>(address);
  }

  getOneModulo(id: any):Observable<ModuloInterface>{
    let address = this.url + 'modulo/' + id;
    return this.http.get<ModuloInterface>(address);
  }

  postModulo(form: ModuloInterface):Observable<ResponseInterface>{
    let address = this.url + 'modulo';
    return this.http.post<ResponseInterface>(address, form);
  }

  putModulo(id: any):Observable<ResponseInterface>{
    let address = this.url + 'modulo/' + id;
    return this.http.put<ResponseInterface>(address, id);
  }

  deleteModulo(id: any):Observable<ResponseInterface>{
    let addres = this.url + 'modulo/' + id;
    return this.http.delete<ResponseInterface>(addres);
  }
}
