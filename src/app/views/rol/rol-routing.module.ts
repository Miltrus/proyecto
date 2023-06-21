import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListRolesComponent } from './list-roles/list-roles.component';
import { NewRolComponent } from './new-rol/new-rol.component';
import { EditRolComponent } from './edit-rol/edit-rol.component'
import { rolePermissionGuard } from 'src/app/auth/guards/rolePermission/role-permission.guard';

const routes: Routes = [

  { path: '', redirectTo: 'list-roles', pathMatch: 'full' },

  {
    path: 'list-roles',
    canMatch: [rolePermissionGuard],
    data: {
      permission: 'listar-roles'
    },
    component: ListRolesComponent,
  },

  {
    path: 'new-rol',
    canMatch: [rolePermissionGuard],
    data: {
      permission: 'crear-rol'
    },
    component: NewRolComponent
  },

  {
    path: 'edit-rol/:id',
    canMatch: [rolePermissionGuard],
    data: {
      permission: 'editar-rol'
    },
    component: EditRolComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolRoutingModule { }
