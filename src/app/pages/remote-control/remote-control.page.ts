import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { AUTO_PUMP_OFF, AUTO_PUMP_ON, PUMP_OFF, PUMP_ON, RemoteService } from 'src/app/services/remote.service';

@Component({
  selector: 'app-remote-control',
  templateUrl: './remote-control.page.html',
  styleUrls: ['./remote-control.page.scss'],
})
export class RemoteControlPage implements OnInit {
  @ViewChild('autoSwitch', { static: true, read: ElementRef }) autoSwitch: ElementRef;
  @ViewChild('pumpSwitch', { static: true, read: ElementRef }) pumpSwitch: ElementRef;
  @ViewChild('blade', { static: true, read: ElementRef }) blade: ElementRef;


  unknown: string = 'Unknown'
  pumpSwitchTouch: boolean
  autoPumpSwitchTouch: boolean
  private id: string

  constructor(
    private navCtrl: NavController,
    private remoteService: RemoteService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.id = localStorage.getItem('id')
    if (!this.id || this.id === 'null' || this.id === 'undefined' || this.id === '0') {
      this.id = prompt('Who are you?')
      localStorage.setItem('id', this.id)
    }
    if (!this.id || this.id === 'null' || this.id === 'undefined' || this.id === '0') {
      this.presentToast('This ID cannot be used')
    }
    else this.remoteService.init('unique-remote-id-for-' + this.id)
  }

  ngOnDestroy() {
    this.remoteService.close()
  }

  changeId() {
    const id = prompt('Your ID', this.id)
    if(id !== this.id) {
      localStorage.setItem('id', id)
      this.id = id
      this.remoteService.reconnect(id)    
    }
  }

  back() {
    this.navCtrl.navigateRoot('/')
  }

  ngAfterContentChecked() {
    this.autoSwitch.nativeElement.checked = this.remoteService.pumpStatus?.isEnabledAutoPump || false
    this.pumpSwitch.nativeElement.setAttribute('value', this.remoteService.pumpStatus?.isPumping || false)
    this.blade.nativeElement.setAttribute('spinning', this.remoteService.pumpStatus?.isPumping || false)
  }

  togglePump({ detail: { value } }) {
    if (this.pumpSwitchTouch) {
      this.pumpSwitchTouch = false
      if (!this.remoteService.isConnectedToPump) return this.presentToast('No connection...')
      this.remoteService.sendPumpSignal(value === 'true' ? PUMP_ON : PUMP_OFF)
    }
  }

  toggleAutoPump({ detail: { checked } }) {
    if (this.autoPumpSwitchTouch) {
      this.autoPumpSwitchTouch = false
      if (!this.remoteService.isConnectedToPump) return this.presentToast('No connection...')
      this.remoteService.sendPumpSignal(checked ? AUTO_PUMP_ON : AUTO_PUMP_OFF)
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 1000
    });
    toast.present();
  }
}
