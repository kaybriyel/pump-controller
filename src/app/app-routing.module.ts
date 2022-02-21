import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'water-pump',
    loadChildren: () => import('./pages/water-pump/water-pump.module').then( m => m.WaterPumpPageModule)
  },
  {
    path: 'water-tank',
    loadChildren: () => import('./pages/water-tank/water-tank.module').then( m => m.WaterTankPageModule)
  },
  {
    path: 'remote-control',
    loadChildren: () => import('./pages/remote-control/remote-control.module').then( m => m.RemoteControlPageModule)
  },
  {
    path: 'remote-control',
    loadChildren: () => import('./pages/remote-control/remote-control.module').then( m => m.RemoteControlPageModule)
  },
  {
    path: 'water-tank',
    loadChildren: () => import('./pages/water-tank/water-tank.module').then( m => m.WaterTankPageModule)
  },
  {
    path: 'water-pump',
    loadChildren: () => import('./pages/water-pump/water-pump.module').then( m => m.WaterPumpPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
