import { Injectable } from '@angular/core';
import { ResponseInterface } from '../../../models/response.interface';
import { RolInterface } from '../../../models/rol.interface';
import { PermisoInterface } from '../../../models/permiso.interface';
import { RolPermisoInterface } from '../../../models/rol-permiso.interface';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'; // 

@Injectable({
  providedIn: 'root'
})
export class RolService {

  url:string = 'http://localhost:3030/';

  constructor(private http:HttpClient) { }

  getAllRoles():Observable<RolInterface[]>{
    let address = this.url + 'rol';
    return this.http.get<RolInterface[]>(address);
  }

  getOneRol(id: any):Observable<RolInterface>{
    let address = this.url + 'rol/' + id;
    return this.http.get<RolInterface>(address);
  }

  postRol(form: RolInterface):Observable<ResponseInterface>{
    let address = this.url + 'rol';
    return this.http.post<ResponseInterface>(address, form);
  }

  putRol(id: any):Observable<ResponseInterface>{
    let address = this.url + 'rol/' + id;
    return this.http.put<ResponseInterface>(address, id);
  }

  deleteRol(id: any):Observable<ResponseInterface>{
    let addres = this.url + 'rol/' + id;
    return this.http.delete<ResponseInterface>(addres);
  }

  getPermisos(): Observable<PermisoInterface[]>{
    let adress = this.url + 'permiso';
    return this.http.get<PermisoInterface[]>(adress);
  }

  postRolPermiso(rolPermiso: RolPermisoInterface): Observable<ResponseInterface> {
    let address = this.url + 'rolPermiso';
    return this.http.post<ResponseInterface>(address, rolPermiso);
  }
  
}
