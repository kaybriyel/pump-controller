import { Injectable } from '@angular/core'
import * as Peer from 'peerjs'
import { PeerService } from './peer.service'
import { AUTO_PUMP_OFF, AUTO_PUMP_ON, FULL, PUMP_OFF, PUMP_ON, RECONNECT_TO_TANK, STATUS } from 'src/app/variables/string'
import { PumpStatus, TankStatus } from 'src/app/variables/interfaces'

@Injectable({
  providedIn: 'root'
})
export class PumpService extends PeerService {
  private _isPumping: boolean = false
  private _autoPump: boolean = false
  private tankConn: Peer.DataConnection
  private isTankConnOpen: boolean = false
  private _tankStatus: TankStatus = null
  private _isConnectingToTank: boolean = false

  public get status(): PumpStatus {
    return {
      isOnline: this.isOnline,
      isPumping: this.isPumping,
      isConnectedToTank: this.isConnectedToTank,
      isEnabledAutoPump: this.isEnabledAutoPump,
      isConnectingToTank: this.isConnectingToTank,
      tankConnectionText: this.tankConnectionText,
      tankConnectionTextColor: this.tankConnectionTextColor,
      connectionText: this.connectionText,
      connectionTextColor: this.connectionTextColor,
      pumpingText: this.pumpingText,
      pumpingTextColor: this.pumpingTextColor,
      autoPumpingText: this.autoPumpingText,
      autoPumpingTextColor: this.autoPumpingTextColor
    }
  }

  public get tankStatus() { return this._tankStatus }

  public get isOnline() { return this.isServerOpen && !this.peer?.disconnected }
  public get isPumping() { return this._isPumping }
  public get isConnectedToTank() { return this.isTankConnOpen }
  public get isEnabledAutoPump() { return this._autoPump }
  public get isConnectingToServer() { return (!this.isServerOpen && !this.peer?.disconnected) }
  public get isConnectingToTank() { return this._isConnectingToTank }

  // view tank status text
  public get tankConnectionText() { return this.isConnectingToTank ? 'Connecting' : this.isConnectedToTank ? 'Connected' : 'Disconnected' }
  public get tankConnectionTextColor() { return this.isConnectingToTank ? 'warning' : this.isConnectedToTank ? 'success' : 'danger' }


  // view status text
  public get connectionText() { return this.isOnline ? 'Connected' : this.isConnectingToServer ? 'Connecting' : 'Disconnected' }
  public get connectionTextColor() { return this.isOnline ? 'success' : this.isConnectingToServer ? 'warning' : 'danger' }
  public get pumpingText() { return this.isPumping ? 'YES' : 'NO' }
  public get pumpingTextColor() { return this.isPumping ? 'success' : 'danger' }
  public get autoPumpingText() { return this.isEnabledAutoPump ? 'YES' : 'NO' }
  public get autoPumpingTextColor() { return this.isEnabledAutoPump ? 'success' : 'danger' }

  constructor() {
    super()
  }

  public init() {
    super.init('unique-pump-id')
    super.peer.on('open', () => {
      this.reconnectToTank()
    })
    super.peer.on('connection', conn => {
      if (conn.peer === 'unique-tank-id') {
        if (this.tankConn) this.tankConn.close()
        this.establishTankConnection(conn)
      } else if (conn.peer.startsWith('unique-remote-id-for-')) this.establishConnection(conn)
    })
    super.peer.on('error', (e: Error) => {
      if (e.message.startsWith('Could not connect to peer unique-tank-id')) {
        this.tankConn = null
        this._isConnectingToTank = false
      }
    })
    window['pumpService'] = this
  }

  public reconnectToTank() {
    if (!this.isConnectingToTank && !this.isConnectedToTank) {
      if (this.debug) console.log('connecting to tank')
      this.isTankConnOpen = false
      this._isConnectingToTank = true
      const conn = super.peer.connect('unique-tank-id')
      conn.on('open', () => this._isConnectingToTank = false)
      conn.on('open', () => this.isTankConnOpen = true)
      super.establishConnection(conn)
      this.establishTankConnection(conn)
    }
  }

  protected establishConnection(conn) {
    super.establishConnection(conn)
    conn.on('open', () => conn.on('data', data => {
      const debug = this.debug
      switch (data.action) {
        case STATUS:
          send(this.status)
          break
        case PUMP_OFF:
          this._isPumping = false
          send(this.status)
          break
        case PUMP_ON:
          this._isPumping = true
          send(this.status)
          break
        case AUTO_PUMP_OFF:
          this._autoPump = false
          send(this.status)
          break
        case AUTO_PUMP_ON:
          this._autoPump = true
          send(this.status)
          break
        case RECONNECT_TO_TANK:
          if(!this.isConnectingToTank && !this.isConnectedToTank) this.reconnectToTank()
        default: break
      }
      function send(payload) {
        if (debug) console.info('received action', data.action)
        if (debug) console.info('sending', payload)
        conn?.send({ payload })
      }
    }))
  }

  private establishTankConnection(conn) {
    conn.on('open', () => {
      this.tankConn = conn
      this.tankConn.on('close', () => setTimeout(() => this.tankConn = null, 1000))
      this.tankConn.on('close', () => this._tankStatus = null)
      this.tankConn.on('close', () => this.isTankConnOpen = false)
      this.tankConn.on('close', () => this.debug ? console.info('Tank connection closed') : null)
      this.tankConn.on('error', (e) => this.debug ? console.error('Tank connection error', e) : null)
      this.requestTankStatus()
    })
  }

  private requestTankStatus() {
    if (this.debug) console.log('Requesting tank status')
    this.tankConn?.on('data', data => {
      if(data.action === FULL) this._isPumping = false
      else if (data.payload) {
        if (this.debug) console.info('received payload', data.payload)
        this._tankStatus = data.payload
      }
      else if (data.action === STATUS) {
        if (this.debug) console.info('received action', data.action)
        if (this.debug) console.info('sending', this.status)
        this.tankConn?.send({ payload: this.status })
      }
    })
    const i = setInterval(() => this.tankConn?.send({ action: STATUS }), 3000)
    this.tankConn.on('close', () => clearInterval(i))
    this.tankConn.on('error', () => clearInterval(i))
  }

  public close() {
    super.close()
    this.tankConn = null
  }
}
