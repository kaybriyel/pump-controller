import { Injectable } from '@angular/core';
import * as Peer from 'peerjs';
import { PeerService } from './peer.service';
import { PumpStatus } from './pump.service';
import { DEC_LEVEL, FULL, INC_LEVEL, STATUS } from './remote.service';


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
  private _waterLevel: number = 0
  private _isConnectingToPump: boolean

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
  public get isConnectedToPump() { return this.isPumpConnOpen }
  public get isConnectingToServer() { return (!this.isServerOpen && !this.peer.disconnected) }
  public get isConnectingToPump() { return this._isConnectingToPump }

  // view text
  public get connectionText() { return this.isOnline ? 'Connected' : this.isConnectingToServer ? 'Connecting' : 'Disconnected' }
  public get connectionTextColor() { return this.isOnline ? 'success' : this.isConnectingToServer ? 'warning' : 'danger' }
  public get pumpConnectionText() { return this.isConnectingToPump ? 'Connecting' : this.isConnectedToPump ? 'Connected' : 'Disconnected' }
  public get pumpConnectionTextColor() { return this.isConnectingToPump ? 'warning' : this.isConnectedToPump ? 'success' : 'danger' }
  public get waterLevel() { return this._waterLevel || 0 }
  public get waterLevelColor() {
    const colors = ['danger', 'warning', 'primary', 'success']
    return colors[Math.floor(this.waterLevel / 25)]
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
      } else if (conn.peer.startsWith('unique-remote-id-for-')) this.establishConnection(conn)
    })
    super.peer.on('error', (e: Error) => {
      if (e.message.startsWith('Could not connect to peer unique-pump-id')) {
        this.pumpConn = null
        this._isConnectingToPump = false
      }
    })
    window['tankService'] = this
  }

  public reconnectToPump() {
    if (!this.isConnectingToPump && !this.isConnectedToPump) {
      if (this.debug) console.log('connecting to pump')
      this.isPumpConnOpen = false
      this._isConnectingToPump = true
      const conn = super.peer.connect('unique-pump-id')
      conn.on('open', () => this._isConnectingToPump = false)
      conn.on('open', () => this.isPumpConnOpen = true)
      super.establishConnection(conn)
      this.establishPumpConnection(conn)
    }
  }

  private establishPumpConnection(conn) {
    conn.on('open', () => {
      this.pumpConn = conn
      conn.on('close', () => setTimeout(() => this.pumpConn = null, 1000))
      conn.on('close', () => this._pumpStatus = null)
      conn.on('close', () => this.isPumpConnOpen = false)
      conn.on('close', () => this.debug ? console.info('Pump connection closed') : null)
      conn.on('error', (e) => this.debug ? console.error('Pump connection error', e) : null)
      this.requestPumpStatus()
    })
  }

  protected establishConnection(conn) {
    super.establishConnection(conn)
    conn.on('open', () => conn.on('data', data => {
      if (data.action === STATUS) {
        if (this.debug) console.info('received action', data.action)
        if (this.debug) console.info('sending', this.status)
        conn?.send({ payload: this.status })
      } else if (data.action === DEC_LEVEL) {
        const diff = data.payload || 0
        this._waterLevel -= diff
        conn?.send({ payload: this.status })
        this.pumpConn?.send({ payload: this.status })
      }
    }))
  }

  private requestPumpStatus() {
    if (this.debug) console.log('Requesting pump status')
    this.pumpConn.on('data', data => {
      const conn = this.pumpConn
      const debug = this.debug
      if (data.payload) {
        if (this.debug) console.info('received payload', data.payload)
        this._pumpStatus = data.payload
        if (this.pumpStatus.isPumping) {
          if (this._waterLevel + 3 <= 100) this._waterLevel += 3
          else {
            this._waterLevel = 100
            this.send({ action: FULL })
          }
        }
      }
      else {
        switch (data.action) {
          case INC_LEVEL:
            this._waterLevel += data.extra
            send(this.status)
            break
          case DEC_LEVEL:
            this._waterLevel -= data.extra
            send(this.status)
          default: break
        }
      }

      function send(payload) {
        if (debug) console.info('received action', data.action)
        if (debug) console.info('sending', payload)
        conn.send({ payload })
      }
    })
    const i = setInterval(() => this.pumpConn?.send({ action: STATUS }), 3000)
    this.pumpConn.on('close', () => clearInterval(i))
    this.pumpConn.on('error', () => clearInterval(i))
  }

  public close() {
    super.close()
    this.pumpConn = null
  }

}
