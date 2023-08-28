import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NovedadRoutingModule } from './novedad-routing.module';
import { ListNovedadesComponent } from './list-novedades/list-novedades.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ListNovedadesComponent,
  ],
  imports: [
    SharedModule,
    NovedadRoutingModule,
  ]
})
export class NovedadModule { }
