import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RemoteControlPageRoutingModule } from './remote-control-routing.module';

import { RemoteControlPage } from './remote-control.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RemoteControlPageRoutingModule
  ],
  declarations: [RemoteControlPage]
})
export class RemoteControlPageModule {}
