import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListUsuariosComponent } from './list-usuarios/list-usuarios.component';
import { NewUsuarioComponent } from './new-usuario/new-usuario.component';
import { EditUsuarioComponent } from './edit-usuario/edit-usuario.component';
import { ProfileComponent } from './profile/profile.component';


const routes: Routes = [
  
  { path: '', redirectTo: 'list-usuarios', pathMatch: 'full' },
  { path: 'list-usuarios', component: ListUsuariosComponent },
  { path: 'new-usuario', component: NewUsuarioComponent },
  { path: 'edit-usuario/:id', component: EditUsuarioComponent },
  { path: 'profile', component: ProfileComponent },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioRoutingModule { }
