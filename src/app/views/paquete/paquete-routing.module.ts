import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListPaquetesComponent } from './list-paquetes/list-paquetes.component';
import { NewPaqueteComponent } from './new-paquete/new-paquete.component';
import { EditPaqueteComponent } from './edit-paquete/edit-paquete.component';
import { rolePermissionGuard } from 'src/app/auth/guards/rolePermission/role-permission.guard';

const routes: Routes = [

  { path: '', redirectTo: 'list-paquetes', pathMatch: 'full' },

  {
    path: 'list-paquetes',
    canMatch: [rolePermissionGuard],
    data: {
      permission: 'listar-paquetes'
    },
    component: ListPaquetesComponent
  },

  {
    path: 'new-paquete',
    canMatch: [rolePermissionGuard],
    data: {
      permission: 'crear-paquete'
    },
    component: NewPaqueteComponent
  },

  {
    path: 'edit-paquete/:id',
    canMatch: [rolePermissionGuard],
    data: {
      permission: 'editar-paquete'
    },
    component: EditPaqueteComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaqueteRoutingModule { }
