import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TankService } from 'src/app/services/tank.service';

@Component({
  selector: 'app-water-tank',
  templateUrl: './water-tank.page.html',
  styleUrls: ['./water-tank.page.scss'],
})
export class WaterTankPage implements OnInit {
  @ViewChild('connectingToPump', {static: true, read: ElementRef}) connectingToPump: ElementRef;
  @ViewChild('connectingToServer', {static: true, read: ElementRef}) connectingToServer: ElementRef;

  unknown = 'Unknown'

  constructor(
    private tankService: TankService,
    private navCtrl: NavController
    ) { }

  ngOnInit() {
    this.tankService.init()
  }

  ngAfterContentChecked() {
    if(!this.tankService.isConnectingToPump) this.connectingToPump.nativeElement.setAttribute('hidden', true)
    else this.connectingToPump.nativeElement.removeAttribute('hidden')

    if(!this.tankService.isConnectingToServer) this.connectingToServer.nativeElement.setAttribute('hidden', true)
    else this.connectingToServer.nativeElement.removeAttribute('hidden')
  }

  ngOnDestroy() {
    this.tankService.close()
  }

  back() {
    this.navCtrl.navigateRoot('/')
  }
}
