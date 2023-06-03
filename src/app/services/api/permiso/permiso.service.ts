import { Injectable } from '@angular/core';
import { ResponseInterface } from '../../../models/response.interface';
import { PermisoInterface } from '../../../models/permiso.interface';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'; // 
import { ModuloInterface } from 'src/app/models/modulo.interface';

@Injectable({
  providedIn: 'root'
})
export class PermisoService {

  url:string = 'http://localhost:3030/';

  constructor(private http:HttpClient) { }

  getAllPermisos():Observable<PermisoInterface[]>{
    let address = this.url + 'permiso';
    return this.http.get<PermisoInterface[]>(address);
  }

  getOnePermiso(id: any):Observable<PermisoInterface>{
    let address = this.url + 'permiso/' + id;
    return this.http.get<PermisoInterface>(address);
  }

  postPermiso(form: PermisoInterface):Observable<ResponseInterface>{
    let address = this.url + 'permiso';
    return this.http.post<ResponseInterface>(address, form);
  }

  putPermiso(id: any):Observable<ResponseInterface>{
    let address = this.url + 'permiso/' + id;
    return this.http.put<ResponseInterface>(address, id);
  }

  deletePermiso(id: any):Observable<ResponseInterface>{
    let addres = this.url + 'permiso/' + id;
    return this.http.delete<ResponseInterface>(addres);
  }

  getModulo():Observable<ModuloInterface[]>{
    let address = this.url + 'modulo/';
    return this.http.get<ModuloInterface[]>(address);
  }
}
