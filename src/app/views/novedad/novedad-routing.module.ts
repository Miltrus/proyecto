import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListNovedadesComponent } from './list-novedades/list-novedades.component';
import { unsavedChangesGuard } from 'src/app/auth/guards/unsaved-changes.guard';

const routes: Routes = [

  { path: '', redirectTo: 'list-novedades', pathMatch: 'full' },

  { path: 'list-novedades', component: ListNovedadesComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NovedadRoutingModule { }