import { Injectable } from '@angular/core';
import { LoginInterface } from '../../../models/login.interface';
import { ResponseInterface } from '../../../models/response.interface';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs'; // 
import { UsuarioInterface } from 'src/app/models/usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  url:string = 'http://localhost:3030/';

  constructor(private http:HttpClient) { }

  onLogin(form: LoginInterface): Observable<ResponseInterface> {
    let address = this.url + 'login';
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<ResponseInterface>(address, form, { headers }).pipe(
      tap((response: ResponseInterface) => {
        if (response.status === 'ok' && response.user && response.token) {
          localStorage.setItem('rolId', response.user.idRol); // Almacena el ID del rol en el localStorage
        }
      })
    );
  }
  

  verifyToken(token: string): Observable<ResponseInterface> {
    let address = this.url + 'token';
    return this.http.post<ResponseInterface>(address, { token });
  }
  
}
