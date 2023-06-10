import { Component, OnInit } from '@angular/core';
import { UsuarioInterface } from '../../../models/usuario.interface';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userData: UsuarioInterface | null = null;

  constructor() { }

  ngOnInit(): void {
    this.getUserData();
  }

  getUserData() {
    const token = localStorage.getItem('token');
    if (token) {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      this.userData = tokenData.user;
    }
  }
}
