import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RemoteControlPage } from './remote-control.page';

const routes: Routes = [
  {
    path: '',
    component: RemoteControlPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RemoteControlPageRoutingModule {}
