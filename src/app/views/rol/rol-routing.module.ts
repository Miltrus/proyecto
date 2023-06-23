import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListRolesComponent } from './list-roles/list-roles.component';
import { NewRolComponent } from './new-rol/new-rol.component';
import { EditRolComponent } from './edit-rol/edit-rol.component';

const routes: Routes = [

  { path: '', redirectTo: 'list-roles', pathMatch: 'full' },

  { path: 'list-roles', component: ListRolesComponent, },

  { path: 'new-rol', component: NewRolComponent },

  { path: 'edit-rol/:id', component: EditRolComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolRoutingModule { }
