import { Injectable } from '@angular/core';
import * as Peer from 'peerjs';
import { PeerService } from './peer.service';
import { PumpStatus } from './pump.service';


export interface TankStatus {
  isOnline: boolean
  isConnectedToPump: boolean
  isConnectingToServer: boolean
  connectionText: string
  connectionTextColor: string
  pumpConnectionText: string
  pumpConnectionTextColor: string
  waterLevel: number
  waterLevelText: string
  waterLevelColor: string
}

@Injectable({
  providedIn: 'root'
})
export class TankService extends PeerService {

  private pumpConn: Peer.DataConnection
  private isPumpConnOpen: boolean
  private _pumpStatus: PumpStatus
  private _waterLevel: number = 26

  public get status(): TankStatus {
    return {
      isOnline: this.isOnline,
      isConnectedToPump: this.isConnectedToPump,
      isConnectingToServer: this.isConnectingToServer,
      connectionText: this.connectionText,
      connectionTextColor: this.connectionTextColor,
      pumpConnectionText: this.pumpConnectionText,
      pumpConnectionTextColor: this.pumpConnectionTextColor,
      waterLevel: this.waterLevel,
      waterLevelText: this.waterLevel + '%',
      waterLevelColor: this.waterLevelColor
    }
  }

  public get pumpStatus() { return this._pumpStatus }

  constructor() {
    super();
  }


  public get isOnline() { return this.isServerOpen && !this.peer.disconnected }
  public get isConnectedToPump() { return this.pumpConn && this.isPumpConnOpen }
  public get isConnectingToServer() { return (!this.isServerOpen && !this.peer.disconnected) }
  public get isConnectingToPump() { return this.pumpConn && !this.isPumpConnOpen }

  // view text
  public get connectionText() { return this.isOnline ? 'Connected' : this.isConnectingToServer ? 'Connecting' : 'Disconnected' }
  public get connectionTextColor() { return this.isOnline ? 'success' : this.isConnectingToServer ? 'warning' : 'danger' }
  public get pumpConnectionText() { return this.isConnectingToPump ? 'Connecting' : this.isConnectedToPump ? 'Connected' : 'Disconnected' }
  public get pumpConnectionTextColor() { return this.isConnectingToPump ? 'warning' : this.isConnectedToPump ? 'success' : 'danger' }
  public get waterLevel() { return this._waterLevel || 0 }
  public get waterLevelColor() {
    const colors = ['danger', 'warning', 'primary', 'success']
    return colors[Math.floor(this.waterLevel/25)]
  }

  public init() {
    super.init('unique-tank-id')
    super.peer.on('open', () => {
      this.reconnectToPump()
    })
    super.peer.on('connection', conn => {
      if (conn.peer === 'unique-pump-id') {
        if (this.pumpConn) this.pumpConn.close()
          this.establishPumpConnection(conn)
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
      if(this.debug) console.log('connecting to pump')
      this.isPumpConnOpen = false
      const conn = super.peer.connect('unique-pump-id')
      super.establishConnection(conn)
      this.establishPumpConnection(conn)
    }
  }

  private establishPumpConnection(conn) {
    conn.on('open', () => {
      this.pumpConn = conn
      this.isPumpConnOpen = true
      this.pumpConn.on('close', () => setTimeout(() => this.pumpConn = null, 1000))
      this.pumpConn.on('close', () => this._pumpStatus = null)
      this.pumpConn.on('close', () => this.debug ? console.info('Pump connection closed') : null)
      this.pumpConn.on('error', (e) => this.debug ? console.error('Pump connection error', e) : null)
      this.pumpConn.on('error', () => setTimeout(() => this.pumpConn = null, 1000))
      this.pumpConn.on('error', () => this._pumpStatus = null)
      this.requestPumpStatus()
    })
  }

  private requestPumpStatus() {
    if(this.debug) console.log('Requesting pump status')
    this.pumpConn.on('data', data => {
      if (data.payload) {
        if(this.debug) console.info('received payload', data.payload)
        this._pumpStatus = data.payload
      }
      else if (data.action === 'status') {
        if(this.debug) console.info('received action', data.action)
        if(this.debug) console.info('sending', this.status)
        this.pumpConn.send({ payload: this.status })
      }
    })
    const i = setInterval(() => this.pumpConn?.send({ action: 'status' }), 5000)
    this.pumpConn.on('close', () => clearInterval(i))
    this.pumpConn.on('error', () => clearInterval(i))
  }

  public close() {
    super.close()
    this.pumpConn = null
  }

}
