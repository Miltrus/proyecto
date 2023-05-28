import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LandingPageComponent } from './views/landing-page/landing-page.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { ListRolesComponent } from './views/rol/list-roles/list-roles.component';
import { NewRolComponent } from './views/rol/new-rol/new-rol.component';
import { EditRolComponent } from './views/rol/edit-rol/edit-rol.component'

import { ListModulosComponent } from './views/modulo/list-modulos/list-modulos.component';
import { NewModuloComponent } from './views/modulo/new-modulo/new-modulo.component';
import { EditModuloComponent } from './views/modulo/edit-modulo/edit-modulo.component';

import { ListPermisosComponent } from './views/permiso/list-permisos/list-permisos.component';
import { NewPermisoComponent } from './views/permiso/new-permiso/new-permiso.component';
import { EditPermisoComponent } from './views/permiso/edit-permiso/edit-permiso.component';

import { ListClientesComponent } from './views/cliente/list-clientes/list-clientes.component';
import { NewClienteComponent } from './views/cliente/new-cliente/new-cliente.component';
import { EditClienteComponent } from './views/cliente/edit-cliente/edit-cliente.component';

import { ListUsuariosComponent } from './views/usuario/list-usuarios/list-usuarios.component';
import { NewUsuarioComponent } from './views/usuario/new-usuario/new-usuario.component';
import { EditUsuarioComponent } from './views/usuario/edit-usuario/edit-usuario.component';

import { ListPaquetesComponent } from './views/paquete/list-paquetes/list-paquetes.component';
import { NewPaqueteComponent } from './views/paquete/new-paquete/new-paquete.component';
import { EditPaqueteComponent } from './views/paquete/edit-paquete/edit-paquete.component';

const routes: Routes = [
  { path: '', redirectTo: 'landing-page', pathMatch: 'full' }, //ruta x defecto
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'landing-page', component: LandingPageComponent },

  { path: 'list-roles', component: ListRolesComponent, },
  { path: 'new-rol', component: NewRolComponent },
  { path: 'edit-rol/:id', component: EditRolComponent },

  { path: 'list-modulos', component: ListModulosComponent },
  { path: 'new-modulo', component: NewModuloComponent },
  { path: 'edit-modulo/:id', component: EditModuloComponent },

  { path: 'list-permisos', component: ListPermisosComponent },
  { path: 'new-permiso', component: NewPermisoComponent },
  { path: 'edit-permiso/:id', component: EditPermisoComponent },

  { path: 'list-clientes', component: ListClientesComponent },
  { path: 'new-cliente', component: NewClienteComponent },
  { path: 'edit-cliente/:id', component: EditClienteComponent },

  { path: 'list-usuarios', component: ListUsuariosComponent },
  { path: 'new-usuario', component: NewUsuarioComponent },
  { path: 'edit-usuario/:id', component: EditUsuarioComponent },

  { path: 'list-paquetes', component: ListPaquetesComponent },
  { path: 'new-paquete', component: NewPaqueteComponent },
  { path: 'edit-paquete/:id', component: EditPaqueteComponent },
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

  ListRolesComponent,
  NewRolComponent,
  EditRolComponent,

  ListModulosComponent,
  NewModuloComponent,
  EditModuloComponent,

  ListPermisosComponent,
  NewPermisoComponent,
  EditPermisoComponent,

  ListClientesComponent,
  NewClienteComponent,
  EditClienteComponent,

  ListUsuariosComponent,
  NewUsuarioComponent,
  EditUsuarioComponent,

  ListPaquetesComponent,
  NewPaqueteComponent,
  EditPaqueteComponent,
]