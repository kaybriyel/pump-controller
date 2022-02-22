import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TankService } from 'src/app/services/tank.service';

@Component({
  selector: 'app-water-tank',
  templateUrl: './water-tank.page.html',
  styleUrls: ['./water-tank.page.scss'],
})
export class WaterTankPage implements OnInit {

  unknown = 'Unknown'

  constructor(
    private tankService: TankService,
    private navCtrl: NavController
    ) { }

  ngOnInit() {
    this.tankService.init()
  }

  ngOnDestroy() {
    this.tankService.close()
  }

  back() {
    this.navCtrl.navigateRoot('/')
  }
}
