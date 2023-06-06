import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LandingPageComponent } from './views/landing-page/landing-page.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

import { ListRolesComponent } from './views/rol/list-roles/list-roles.component';
import { NewRolComponent } from './views/rol/new-rol/new-rol.component';
import { EditRolComponent } from './views/rol/edit-rol/edit-rol.component'

import { ListClientesComponent } from './views/cliente/list-clientes/list-clientes.component';
import { NewClienteComponent } from './views/cliente/new-cliente/new-cliente.component';
import { EditClienteComponent } from './views/cliente/edit-cliente/edit-cliente.component';

import { ListUsuariosComponent } from './views/usuario/list-usuarios/list-usuarios.component';
import { NewUsuarioComponent } from './views/usuario/new-usuario/new-usuario.component';
import { EditUsuarioComponent } from './views/usuario/edit-usuario/edit-usuario.component';

import { ListPaquetesComponent } from './views/paquete/list-paquetes/list-paquetes.component';
import { NewPaqueteComponent } from './views/paquete/new-paquete/new-paquete.component';
import { EditPaqueteComponent } from './views/paquete/edit-paquete/edit-paquete.component';

import { ListNovedadesComponent } from './views/novedad/list-novedades/list-novedades.component';


const routes: Routes = [
  { path: '', redirectTo: 'landing-page', pathMatch: 'full' }, //ruta x defecto
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'landing-page', component: LandingPageComponent },

  { path: 'list-roles', component: ListRolesComponent, },
  { path: 'new-rol', component: NewRolComponent },
  { path: 'edit-rol/:id', component: EditRolComponent },

  { path: 'list-clientes', component: ListClientesComponent },
  { path: 'new-cliente', component: NewClienteComponent },
  { path: 'edit-cliente/:id', component: EditClienteComponent },

  { path: 'list-usuarios', component: ListUsuariosComponent },
  { path: 'new-usuario', component: NewUsuarioComponent },
  { path: 'edit-usuario/:id', component: EditUsuarioComponent },

  { path: 'list-paquetes', component: ListPaquetesComponent },
  { path: 'new-paquete', component: NewPaqueteComponent },
  { path: 'edit-paquete/:id', component: EditPaqueteComponent },

  { path: 'list-novedades', component: ListNovedadesComponent },

  { path: '**', component: NotFoundComponent }, //pal not found
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export const routingComponents = [
  LoginComponent,
  DashboardComponent,
  LandingPageComponent,
  NotFoundComponent,

  ListRolesComponent,
  NewRolComponent,
  EditRolComponent,

  ListClientesComponent,
  NewClienteComponent,
  EditClienteComponent,

  ListUsuariosComponent,
  NewUsuarioComponent,
  EditUsuarioComponent,

  ListPaquetesComponent,
  NewPaqueteComponent,
  EditPaqueteComponent,

  ListNovedadesComponent,
]