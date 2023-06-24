import { Injectable } from '@angular/core';
import { ResponseInterface } from '../../../models/response.interface';
import { RolInterface } from '../../../models/rol.interface';
import { PermisoInterface } from '../../../models/permiso.interface';
import { RolPermisoInterface } from '../../../models/rol-permiso.interface';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'; // 
import { RolPermisoResponseInterface } from 'src/app/models/rol-permiso-response.interface';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  url: string = 'http://localhost:3030/';

  constructor(private http: HttpClient) { }

  getAllRoles(): Observable<RolInterface[]> {
    let address = this.url + 'rol';
    return this.http.get<RolInterface[]>(address);
  }

  getOneRol(id: any): Observable<RolInterface> {
    let address = this.url + 'rol/' + id;
    return this.http.get<RolInterface>(address);
  }

  postRol(form: RolInterface): Observable<ResponseInterface> {
    let address = this.url + 'rol';
    return this.http.post<ResponseInterface>(address, form);
  }

  putRol(id: any): Observable<ResponseInterface> {
    let address = this.url + 'rol/' + id;
    return this.http.put<ResponseInterface>(address, id);
  }

  deleteRol(id: any): Observable<ResponseInterface> {
    let addres = this.url + 'rol/' + id;
    return this.http.delete<ResponseInterface>(addres);
  }

  getAllPermisos(): Observable<PermisoInterface[]> {
    let address = this.url + 'permiso';
    return this.http.get<PermisoInterface[]>(address);
  }

  getLastRolId(): Observable<any> {
    let address = this.url + 'rol/lastId';
    return this.http.get<any>(address);
  }

  guardarRolPermiso(rolPermiso: RolPermisoInterface): Observable<ResponseInterface> {
    let address = this.url + 'rolPermiso';
    return this.http.post<ResponseInterface>(address, rolPermiso);
  }

  getRolPermisos(idRol: any): Observable<RolPermisoResponseInterface> {
    let address = this.url + 'rolPermiso/' + idRol + '/permisos';
    return this.http.get<RolPermisoResponseInterface>(address);
  }

  putRolPermiso(idRol: any, idPermisos: any[]): Observable<ResponseInterface> {
    let address = this.url + 'rolPermiso/' + idRol;
    let body = { idRol: idRol, idPermisos: idPermisos }; // Crear el objeto JSON con las propiedades correspondientes
    return this.http.put<ResponseInterface>(address, body);
  }


}
