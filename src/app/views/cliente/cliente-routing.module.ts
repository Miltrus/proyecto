import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListClientesComponent } from './list-clientes/list-clientes.component';
import { NewClienteComponent } from './new-cliente/new-cliente.component';
import { EditClienteComponent } from './edit-cliente/edit-cliente.component';

const routes: Routes = [

  { path: '', redirectTo: 'list-clientes', pathMatch: 'full' },
  { path: 'list-clientes', component: ListClientesComponent },
  { path: 'new-cliente', component: NewClienteComponent },
  { path: 'edit-cliente/:id', component: EditClienteComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClienteRoutingModule { }
