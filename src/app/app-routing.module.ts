import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './views/landing-page/landing-page.component';
import { isLoggedInGuard } from './auth/guards/isLoggedIn/is-logged-in.guard';
import { rolePermissionGuard } from './auth/guards/rolePermission/role-permission.guard';


const routes: Routes = [

  { path: '', redirectTo: 'landing-page', pathMatch: 'full' }, //ruta x defecto

  { path: 'landing-page', component: LandingPageComponent },

  { path: 'login', loadChildren: () => import('./components/login/login.module').then(m => m.LoginModule) },

  { path: 'dashboard', canMatch: [isLoggedInGuard], loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule) },


  {
    path: 'rol',
    canMatch: [isLoggedInGuard],
    loadChildren: () => import('./views/rol/rol.module').then(m => m.RolModule)
  },


  {
    path: 'cliente',
    canMatch: [isLoggedInGuard],
    loadChildren: () => import('./views/cliente/cliente.module').then(m => m.ClienteModule)
  },


  {
    path: 'usuario',
    canMatch: [isLoggedInGuard],
    loadChildren: () => import('./views/usuario/usuario.module').then(m => m.UsuarioModule)
  },


  {
    path: 'paquete',
    canMatch: [isLoggedInGuard],
    loadChildren: () => import('./views/paquete/paquete.module').then(m => m.PaqueteModule)
  },


  {
    path: 'novedad',
    canMatch: [isLoggedInGuard],
    loadChildren: () => import('./views/novedad/novedad.module').then(m => m.NovedadModule)
  },


  { path: '**', loadChildren: () => import('./components/not-found/not-found.module').then(m => m.NotFoundModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }