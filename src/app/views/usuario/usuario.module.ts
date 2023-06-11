import { NgModule } from '@angular/core';

import { UsuarioRoutingModule } from './usuario-routing.module';
import { ListUsuariosComponent } from './list-usuarios/list-usuarios.component';
import { EditUsuarioComponent } from './edit-usuario/edit-usuario.component';
import { NewUsuarioComponent } from './new-usuario/new-usuario.component';
import { ProfileComponent } from './profile/profile.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    ListUsuariosComponent,
    EditUsuarioComponent,
    NewUsuarioComponent,
    ProfileComponent,
  ],
  imports: [
    SharedModule,
    UsuarioRoutingModule,
  ]
})
export class UsuarioModule { }
