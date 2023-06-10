import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LandingPageComponent } from './views/landing-page/landing-page.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NotFoundComponent } from './components/not-found/not-found.component';


const routes: Routes = [

  { path: '', redirectTo: 'landing-page', pathMatch: 'full' }, //ruta x defecto
  
  { path: 'landing-page', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },

  { path: 'rol', loadChildren: () => import('./views/rol/rol.module').then(m => m.RolModule) },

  { path: 'cliente', loadChildren: () => import('./views/cliente/cliente.module').then(m => m.ClienteModule) },

  { path: 'usuario', loadChildren: () => import('./views/usuario/usuario.module').then(m => m.UsuarioModule) },

  { path: 'paquete', loadChildren: () => import('./views/paquete/paquete.module').then(m => m.PaqueteModule) },

  { path: 'novedad', loadChildren: () => import('./views/novedad/novedad.module').then(m => m.NovedadModule) },

  { path: '**', component: NotFoundComponent }, //pal not found
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }