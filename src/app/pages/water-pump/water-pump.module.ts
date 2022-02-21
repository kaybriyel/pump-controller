import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WaterPumpPageRoutingModule } from './water-pump-routing.module';

import { WaterPumpPage } from './water-pump.page';
import { PumpService } from 'src/app/services/pump.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WaterPumpPageRoutingModule
  ],
  declarations: [WaterPumpPage],
  providers: [
  ]
})
export class WaterPumpPageModule {}
