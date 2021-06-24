import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QueryConstructionRoutingModule } from './query-construction-routing.module';
import { QueryConstructionComponent } from './query-construction.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { Ng5SliderModule } from 'ng5-slider';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import { HomeModule } from '@app/home/home.module';

@NgModule({
  declarations: [QueryConstructionComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LeafletModule,
    Ng5SliderModule,
    LeafletDrawModule,
    FormsModule,
    QueryConstructionRoutingModule
  ],
})
export class QueryConstructionModule {}
