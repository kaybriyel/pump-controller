import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WaterTankPageRoutingModule } from './water-tank-routing.module';

import { WaterTankPage } from './water-tank.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WaterTankPageRoutingModule
  ],
  declarations: [WaterTankPage]
})
export class WaterTankPageModule {}
