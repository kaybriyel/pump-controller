import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WaterPumpPage } from './water-pump.page';

const routes: Routes = [
  {
    path: '',
    component: WaterPumpPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WaterPumpPageRoutingModule {}
