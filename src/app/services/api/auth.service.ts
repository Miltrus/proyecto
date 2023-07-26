import { Injectable } from '@angular/core';
import { LoginInterface } from '../../models/login.interface';
import { ResponseInterface } from '../../models/response.interface';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'; // tap is used to debug observables

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url: string = 'http://localhost:3030/auth/';

  constructor(private http: HttpClient) { }

  onLogin(form: LoginInterface): Observable<ResponseInterface> {
    let address = this.url + 'login';
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<ResponseInterface>(address, form, { headers });
  }

  onForgotPassword(form: any): Observable<ResponseInterface> {
    let address = this.url + 'forgot-pwd';
    return this.http.post<ResponseInterface>(address, form);
  }

  onNewPwd(form: any): Observable<ResponseInterface> {
    let address = this.url + 'new-pwd';
    return this.http.post<ResponseInterface>(address, form);
  }
}