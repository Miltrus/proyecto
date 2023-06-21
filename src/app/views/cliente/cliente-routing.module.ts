import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListClientesComponent } from './list-clientes/list-clientes.component';
import { NewClienteComponent } from './new-cliente/new-cliente.component';
import { EditClienteComponent } from './edit-cliente/edit-cliente.component';
import { rolePermissionGuard } from 'src/app/auth/guards/rolePermission/role-permission.guard';

const routes: Routes = [

  { path: '', redirectTo: 'list-clientes', pathMatch: 'full' },

  {
    path: 'list-clientes',
    canMatch: [rolePermissionGuard],
    data: {
      permission: 'listar-clientes'
    },
    component: ListClientesComponent
  },

  {
    path: 'new-cliente',
    canMatch: [rolePermissionGuard],
    data: {
      permission: 'crear-cliente'
    },
    component: NewClienteComponent
  },

  {
    path: 'edit-cliente/:id',
    canMatch: [rolePermissionGuard],
    data: {
      permission: 'editar-cliente'
    },
    component: EditClienteComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClienteRoutingModule { }
