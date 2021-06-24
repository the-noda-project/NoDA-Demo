import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DbconnectionPopUpComponent } from './dbconnection-pop-up/dbconnection-pop-up.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    LeafletModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    SharedModule,
    HomeRoutingModule,
  ],
  declarations: [HomeComponent, DbconnectionPopUpComponent]
})
export class HomeModule {}
