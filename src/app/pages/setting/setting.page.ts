import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PeerHost } from 'src/app/variables/interfaces';
import { PEER_HOST, REMOTE_SERVER } from 'src/app/variables/string';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  @ViewChild('remoteServerToggler', { static: true, read: ElementRef }) remoteServerToggler: ElementRef;

  ip: string[]
  port: number|string
  remoteServer: boolean

  constructor() {
    this.remoteServer = localStorage.getItem(REMOTE_SERVER) === 'true' ? true : false
  }

  ngOnInit() {
    let peerHost = localStorage.getItem(PEER_HOST)
    if(peerHost) {
      const host = JSON.parse(peerHost) as PeerHost
      if(this.isValidIP(host?.ip.split('.')))
        this.ip = host.ip.split('.')
      this.port = host?.port || location.port || 80
    }
    else if(this.isValidIP(location.hostname.split('.'))) {
      this.ip = location.hostname.split('.')
      this.port = location.port || 80
    }
    
    if(!this.isValidIP(this.ip)) this.ip = []
    if(!this.isValidPORT(this.port as number)) this.port = 80
  }

  ngOnDestroy() {
    const ip = this.isValidIP(this.ip) ? this.ip.join('.') : '/'
    const port = this.isValidPORT(this.port as number) ? this.port : 80
    localStorage.setItem(PEER_HOST, JSON.stringify({ip, port}))
  }

  isValidIP(ip: string[]) {
    if(Array.isArray(ip) && ip.length === 4) {
      const _ip = ip.map(i => parseInt(i))
      return _ip.every(i => i >= 0 && i <= 255)
    }
    else return false
  }

  isValidPORT(port: number) {
    return port && port > 0
  }

  onIPChange() {
    const _ip = this.ip.map(i => parseInt(i))
    _ip.forEach((n, i) => {
      if(n > 255) this.ip[i] = '255'
      else if(n < 0) this.ip[i] = '0'
    });
  }

  onPortChange() {
    if(this.port < 0) this.port = 80
  }

  toggleServer({ detail: { checked } }) {
    this.remoteServer = checked
    localStorage.setItem(REMOTE_SERVER, checked)
  }

  ngAfterContentChecked() {
    this.remoteServerToggler.nativeElement.checked = this.remoteServer
  }

  restoreDefault() {
    const ip = location.hostname.split('.')
    if(this.isValidIP(ip)) this.ip = ip
    if(this.isValidPORT(parseInt(location.port))) this.port = location.port
    else this.port = 80
  }
}
