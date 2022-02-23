import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AUTO_PUMP_OFF, AUTO_PUMP_ON, PUMP_OFF, PUMP_ON, RemoteService } from 'src/app/services/remote.service';

@Component({
  selector: 'app-remote-control',
  templateUrl: './remote-control.page.html',
  styleUrls: ['./remote-control.page.scss'],
})
export class RemoteControlPage implements OnInit {
  @ViewChild('autoSwitch', {static: true, read: ElementRef}) autoSwitch: ElementRef;
  @ViewChild('blade', {static: true, read: ElementRef}) blade: ElementRef;


  unknown:string = 'Unknown'
  pumpSwitch: boolean
  autoPumpSwitch: boolean

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

  ngAfterContentChecked() {
    this.autoSwitch.nativeElement.checked = this.remoteService.pumpStatus?.isEnabledAutoPump || false
    this.blade.nativeElement.setAttribute('spinning', this.remoteService.pumpStatus?.isPumping || false)
  }

  togglePump({ detail: { value } }) {
    if(!this.remoteService.isConnectedToPump) return alert('No connection....')
    if(this.pumpSwitch) {
      this.remoteService.sendPumpSignal(value === 'true' ? PUMP_ON : PUMP_OFF)
      this.pumpSwitch = false
    }
  }

  toggleAutoPump({ detail : { checked }}) {
    if(!this.remoteService.isConnectedToPump) return alert('No connection....')
    if(this.autoPumpSwitch) {
      this.remoteService.sendPumpSignal(checked ? AUTO_PUMP_ON : AUTO_PUMP_OFF)
      this.autoPumpSwitch = false
    }
  }
  
}
