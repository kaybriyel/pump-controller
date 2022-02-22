import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { RemoteService } from 'src/app/services/remote.service';

@Component({
  selector: 'app-remote-control',
  templateUrl: './remote-control.page.html',
  styleUrls: ['./remote-control.page.scss'],
})
export class RemoteControlPage implements OnInit {

  constructor(
    private navCtrl: NavController,
    private remoteService: RemoteService
  ) { }

  ngOnInit() {
    this.remoteService.init('unique-remote-id-for-1')
  }

  ngOnDestroy() {
    this.remoteService.close()
  }

  back() {
    this.navCtrl.navigateRoot('/')
  }
}
