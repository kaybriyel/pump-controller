import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WaterTankPage } from './water-tank.page';

const routes: Routes = [
  {
    path: '',
    component: WaterTankPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WaterTankPageRoutingModule {}
