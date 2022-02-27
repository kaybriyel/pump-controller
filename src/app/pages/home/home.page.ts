import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  remoteServer: boolean

  constructor(public navCtrl: NavController) {
  }

  goto(url: string) {
    this.navCtrl.navigateRoot(url)
  }

}
