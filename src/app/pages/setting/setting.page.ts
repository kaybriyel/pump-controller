import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  ip: number[]|string[] = []

  constructor() { }

  ngOnInit() {
  }

  onInput() {
    this.ip.forEach((n, i) => {
      if(n > 255) this.ip[i] = 255
      else if(n < 0) this.ip[i] = 0
    });
  }

}
