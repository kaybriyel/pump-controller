import { Injectable } from '@angular/core'
import * as Peer from 'peerjs'
import { PeerService } from './peer.service'

@Injectable({
  providedIn: 'root'
})
export class PumpService extends PeerService {
  private _isPumping: boolean = false
  private _autoPump: boolean = false
  private tankConn: Peer.DataConnection
  private isTankConnOpen: boolean

  public get status() {
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

  public tankStatus: any

  public get isOnline() { return this.isServerOpen && !this.peer.disconnected }
  public get isPumping() { return this._isPumping }
  public get isConnectedToTank() { return this.tankConn && this.isTankConnOpen }
  public get isEnabledAutoPump() { return this._autoPump }
  public get isConnectingToServer() { return (!this.isServerOpen && !this.peer.disconnected) }
  public get isConnectingToTank() { return this.tankConn && !this.isTankConnOpen }

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
        if (!this.isConnectedToTank) {
          this.tankConn = conn
          this.establishTankConnection()
        }
      }
    })
    super.peer.on('error', (e: Error) => {
      if (e.message.startsWith('Could not connect to peer')) {
        this.tankConn = null
      }
    })
    window['pumpService'] = this
  }

  public reconnectToTank() {
    if (!this.isConnectedToTank) {
      console.log('connecting to tank')
      this.isTankConnOpen = false
      this.tankConn = super.peer.connect('unique-tank-id')
      this.establishTankConnection()
    }
  }

  private establishTankConnection() {
    this.tankConn.on('open', () => {
      this.isTankConnOpen = true
      this.tankConn?.on('close', () => this.tankConn = null)
      this.tankConn?.on('close', () => console.info('Tank connection closed'))
      this.tankConn?.on('error', (e) => console.error('Tank connection error', e))
      this.tankConn?.on('error', () => this.tankConn = null)
      this.requestTankStatus()
    })
  }

  private requestTankStatus() {
    console.log('Requesting tank status')
    this.tankConn?.on('data', data => {
      if (data.payload) {
        console.info('received payload', data.payload)
        this.tankStatus = data.payload
      }
      else if (data.action === 'status') {
        console.info('received action', data.action)
        console.info('sending', this.status)
        this.tankConn?.send({ payload: this.status })
      }
    })
    this.tankConn?.send({ action: 'status' })
  }

  public close() {
    super.close()
    this.tankConn = null
  }
}
