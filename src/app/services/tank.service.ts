import { Injectable } from '@angular/core';
import * as Peer from 'peerjs';
import { PeerService } from './peer.service';


interface TankStatus {
  isOnline: boolean
  isConnectedToPump: boolean
  isConnectingToServer: boolean
  connectionText: string
  connectionTextColor: string
}

@Injectable({
  providedIn: 'root'
})
export class TankService extends PeerService {

  private pumpConn: Peer.DataConnection
  private isPumpConnOpen: boolean

  public get status(): TankStatus {
    return {
      isOnline: this.isOnline,
      isConnectedToPump: this.isConnectedToPump,
      isConnectingToServer: this.isConnectingToServer,
      connectionText: this.connectionText,
      connectionTextColor: this.connectionTextColor
    }
  }

  public pumpStatus: any

  constructor() {
    super();
  }


  public get isOnline() { return this.isServerOpen && !this.peer.disconnected }
  public get isConnectedToPump() { return this.pumpConn != null }
  public get isConnectingToServer() { return (!this.isServerOpen && !this.peer.disconnected) }
  // view text
  public get connectionText() { return this.isOnline ? 'Connected' : this.isConnectingToServer ? 'Connecting' : 'Disconnected' }
  public get connectionTextColor() { return this.isOnline ? 'success' : this.isConnectingToServer ? 'warning' : 'danger' }

  public init() {
    super.init('unique-tank-id')
    super.peer.on('open', () => {
      this.reconnectToPump()
    })
    super.peer.on('connection', conn => {
      if (conn.peer === 'unique-tank-id') {
        if (!this.isConnectedToPump) {
          this.pumpConn = conn
          this.establishPumpConnection()
        }
      }
    })
    super.peer.on('error', (e: Error) => {
      if (e.message.startsWith('Could not connect to peer')) {
        this.pumpConn = null
      }
    })
    window['tankService'] = this
  }

  public reconnectToPump() {
    if (!this.isConnectedToPump) {
      console.log('connecting to pump')
      this.isPumpConnOpen = false
      this.pumpConn = super.peer.connect('unique-pump-id')
      this.establishPumpConnection()
    }
  }

  private establishPumpConnection() {
    this.pumpConn.on('open', () => {
      this.isPumpConnOpen = true
      this.pumpConn?.on('close', () => this.pumpConn = null)
      this.pumpConn?.on('close', () => console.info('Pump connection closed'))
      this.pumpConn?.on('error', (e) => console.error('Pump connection error', e))
      this.pumpConn?.on('error', () => this.pumpConn = null)
      this.requestPumpStatus()
    })
  }

  private requestPumpStatus() {
    console.log('Requesting pump status')
    this.pumpConn?.on('data', data => {
      if (data.payload) {
        console.info('received payload', data.payload)
        this.pumpStatus = data.payload
      }
      else if (data.action === 'status') {
        console.info('received action', data.action)
        console.info('sending', this.status)
        this.pumpConn.send({ payload: this.status })
      }
    })
    this.pumpConn?.send({ action: 'status' })
  }

  public close() {
    super.close()
    this.pumpConn = null
  }

}
