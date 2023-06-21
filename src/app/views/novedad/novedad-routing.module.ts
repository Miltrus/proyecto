import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListNovedadesComponent } from './list-novedades/list-novedades.component';
import { rolePermissionGuard } from 'src/app/auth/guards/rolePermission/role-permission.guard';

const routes: Routes = [

  { path: '', redirectTo: 'list-novedades', pathMatch: 'full' },

  {
    path: 'list-novedades',
    canMatch: [rolePermissionGuard],
    data: {
      permission: 'listar-novedades'
    },
    component: ListNovedadesComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NovedadRoutingModule { }
