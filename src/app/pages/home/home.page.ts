import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { REMOTE_SERVER } from 'src/app/services/remote.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('remoteServerToggler', { static: true, read: ElementRef }) remoteServerToggler: ElementRef;

  remoteServer: boolean

  constructor(public navCtrl: NavController) {
    this.remoteServer = localStorage.getItem(REMOTE_SERVER) === 'true' ? true : false
  }

  goto(url: string) {
    this.navCtrl.navigateRoot(url)
  }

  ngAfterContentChecked() {
    this.remoteServerToggler.nativeElement.checked = this.remoteServer
  }

  toggleServer({ detail: checked }) {
    this.remoteServer = checked
    localStorage.setItem(REMOTE_SERVER, checked)
  }
}
