import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { NavController } from '@ionic/angular';
import { PumpService } from 'src/app/services/pump.service';
import { STATUS } from 'src/app/services/remote.service';

@Component({
  selector: 'app-water-pump',
  templateUrl: './water-pump.page.html',
  styleUrls: ['./water-pump.page.scss'],
})
export class WaterPumpPage implements OnInit {
  @ViewChild('blade', {static: true, read: ElementRef}) blade: ElementRef;
  @ViewChild('connectingToTank', {static: true, read: ElementRef}) connectingToTank: ElementRef;
  @ViewChild('connectingToServer', {static: true, read: ElementRef}) connectingToServer: ElementRef;

  unknown = 'Unknown'

  constructor(
    private pumpService: PumpService,
    private navCtrl: NavController
    ) { }

  ngOnInit() {
    this.pumpService.init()
    console.log('ng init')
  }
  
  ngAfterContentChecked() {
    this.blade.nativeElement.setAttribute('spinning', this.pumpService.isPumping)
    if(!this.pumpService.isConnectingToTank) this.connectingToTank.nativeElement.setAttribute('hidden', true)
    else this.connectingToTank.nativeElement.removeAttribute('hidden')

    if(!this.pumpService.isConnectingToServer) this.connectingToServer.nativeElement.setAttribute('hidden', true)
    else this.connectingToServer.nativeElement.removeAttribute('hidden')
    
  }

  ngOnDestroy() {
    this.pumpService.close()
  }

  back() {
    this.navCtrl.navigateRoot('/')
  }
}
