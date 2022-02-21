import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-remote-control',
  templateUrl: './remote-control.page.html',
  styleUrls: ['./remote-control.page.scss'],
})
export class RemoteControlPage implements OnInit {

  constructor(
    private navCtrl: NavController
  ) { }

  ngOnInit() {
  }

  back() {
    this.navCtrl.navigateRoot('/')
  }
}
