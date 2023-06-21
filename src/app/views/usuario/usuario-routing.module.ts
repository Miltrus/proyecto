import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListUsuariosComponent } from './list-usuarios/list-usuarios.component';
import { NewUsuarioComponent } from './new-usuario/new-usuario.component';
import { EditUsuarioComponent } from './edit-usuario/edit-usuario.component';
import { ProfileComponent } from './profile/profile.component';
import { rolePermissionGuard } from 'src/app/auth/guards/rolePermission/role-permission.guard';


const routes: Routes = [

  { path: '', redirectTo: 'list-usuarios', pathMatch: 'full' },

  {
    path: 'list-usuarios',
    canMatch: [rolePermissionGuard],
    data: {
      permission: 'listar-usuarios'
    },
    component: ListUsuariosComponent
  },

  {
    path: 'new-usuario',
    canMatch: [rolePermissionGuard],
    data: {
      permission: 'crear-usuario'
    },
    component: NewUsuarioComponent
  },

  {
    path: 'edit-usuario/:id',
    canMatch: [rolePermissionGuard],
    data: {
      permission: 'editar-usuario'
    },
    component: EditUsuarioComponent
  },

  { path: 'profile', component: ProfileComponent },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioRoutingModule { }
