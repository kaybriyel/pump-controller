import { Injectable } from '@angular/core';
import * as Peer from 'peerjs';
import { PeerService } from './peer.service';
import { PumpStatus } from './pump.service';
import { TankStatus } from './tank.service';

export const PUMP_OFF = 'PUMP_OFF'
export const PUMP_ON = 'PUMP_ON'
export const AUTO_PUMP_OFF = 'AUTO_PUMP_OFF'
export const AUTO_PUMP_ON = 'AUTO_PUMP_ON'
export const RECONNECT_TO_PUMP = 'RECONNEC_TO_PUMP'
export const RECONNECT_TO_TANK = 'RECONNECT_TO_TANK'
export const STATUS = 'STATUS'
export const INC_LEVEL = 'INC_LEVEL'
export const DEC_LEVEL = 'DEC_LEVEL'
export const FULL = 'FULL'
export const REMOTE_SERVER = 'REMOTE_SERVER'

@Injectable({
  providedIn: 'root'
})
export class RemoteService extends PeerService {

  private pumpConn: Peer.DataConnection
  private tankConn: Peer.DataConnection

  private _pumpStatus: PumpStatus
  private _tankStatus: TankStatus

  private isPumpConnOpen: boolean
  private isTankConnOpen: boolean

  private _isConnectingToPump: boolean
  private _isConnectingToTank: boolean

  public get isOnline() { return this.peer && this.isServerOpen && !this.peer.disconnected }
  public get isConnectingToServer() { return ( this.peer && !this.isServerOpen && !this.peer.disconnected) }

  public get isConnectingToPump() { return this._isConnectingToPump }
  public get isConnectingToTank() { return this._isConnectingToTank }

  public get isConnectedToTank() { return this.tankConn && this.isTankConnOpen }
  public get isConnectedToPump() { return this.pumpConn && this.isPumpConnOpen }

  public get connectionText() { return this.isOnline ? 'Connected' : this.isConnectingToServer ? 'Connecting' : 'Disconnected' }
  public get pumpConnectionText() { return this.isConnectingToPump ? 'Connecting' : this.isConnectedToPump ? 'Connected' : 'Disconnected' }
  public get tankConnectionText() { return this.isConnectingToTank ? 'Connecting' : this.isConnectedToTank ? 'Connected' : 'Disconnected' }

  public get connectionTextColor() { return this.isOnline ? 'success' : this.isConnectingToServer ? 'warning' : 'danger' }
  public get pumpConnectionTextColor() { return this.isConnectingToPump ? 'warning' : this.isConnectedToPump ? 'success' : 'danger' }
  public get tankConnectionTextColor() { return this.isConnectingToTank ? 'warning' : this.isConnectedToTank ? 'success' : 'danger' }

  public get pumpStatus() { return this._pumpStatus }
  public get tankStatus() { return this._tankStatus }

  constructor() {
    super();
  }

  public get status() { return this.isOnline }

  public init(id: string): void {
    if (!id) throw new Error('Required id')
    super.init(id)
    super.peer.on('open', () => {
      this.reconnectToPump()
      this.reconnectToTank()
    })
    super.peer.on('connection', conn => {
      if (conn.peer === 'unique-pump-id') {
        if (this.pumpConn) this.pumpConn.close()
        this.establishPumpConnection(conn)
      }
      if (conn.peer === 'unique-tank-id') {
        if (this.tankConn) this.tankConn.close()
        this.establishTankConnection(conn)
      }
    })
    super.peer.on('error', (e: Error) => {
      if (e.message.startsWith('Could not connect to peer unique-pump-id')) {
        this.pumpConn = null
        this._isConnectingToPump = false
      }
      if (e.message.startsWith('Could not connect to peer unique-tank-id')) {
        this.tankConn = null
        this._isConnectingToTank = false
      }
    })
    window['remoteService'] = this
  }

  public reconnectToPump() {
    if (!this.isConnectingToPump && !this.isConnectedToPump) {
      if (this.debug) console.log('connecting to pump')
      this.isPumpConnOpen = false
      this._isConnectingToPump = true
      const conn = super.peer.connect('unique-pump-id')
      conn.on('open', () => this._isConnectingToPump = false)
      super.establishConnection(conn)
      this.establishPumpConnection(conn)
    }
  }

  public reconnectToTank() {
    if (!this.isConnectingToTank && !this.isConnectedToTank) {
      if (this.debug) console.log('connecting to tank')
      this.isTankConnOpen = false
      this._isConnectingToTank = true
      const conn = super.peer.connect('unique-tank-id')
      conn.on('open', () => this._isConnectingToTank = false)
      super.establishConnection(conn)
      this.establishTankConnection(conn)
    }
  }

  private establishPumpConnection(conn) {
    conn.on('open', () => {
      this.pumpConn = conn
      this.isPumpConnOpen = true
      this.pumpConn.on('close', () => this.isPumpConnOpen = false)
      this.pumpConn.on('close', () => setTimeout(() => this.pumpConn = null, 1000))
      this.pumpConn.on('close', () => this._pumpStatus = null)
      this.pumpConn.on('close', () => this.debug ? console.info('Pump connection closed') : null)
      this.pumpConn.on('error', (e) => this.debug ? console.error('Pump connection error', e) : null)
      this.requestPumpStatus()
    })
  }

  private establishTankConnection(conn) {
    conn.on('open', () => {
      this.tankConn = conn
      this.isTankConnOpen = true
      this.tankConn.on('close', () => this.isTankConnOpen = false)
      this.tankConn.on('close', () => setTimeout(() => this.tankConn = null, 1000))
      this.tankConn.on('close', () => this._tankStatus = null)
      this.tankConn.on('close', () => this.debug ? console.info('Tank connection closed') : null)
      this.tankConn.on('error', (e) => this.debug ? console.error('Tank connection error', e) : null)
      this.requestTankStatus()
    })
  }

  private requestTankStatus() {
    if (this.debug) console.log('Requesting tank status')
    this.tankConn?.on('data', data => {
      if (data.payload) {
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

  private requestPumpStatus() {
    if (this.debug) console.log('Requesting pump status')
    this.pumpConn.on('data', data => {
      if (data.payload) {
        if (this.debug) console.info('received payload', data.payload)
        this._pumpStatus = data.payload
      }
      else if (data.action === STATUS) {
        if (this.debug) console.info('received action', data.action)
        if (this.debug) console.info('sending', this.status)
        this.pumpConn.send({ payload: this.status })
      }
    })
    const i = setInterval(() => this.pumpConn?.send({ action: STATUS }), 3000)
    this.pumpConn.on('close', () => clearInterval(i))
    this.pumpConn.on('error', () => clearInterval(i))
  }

  public reconnectPumpToTank() {
    this.pumpConn?.send({ action: RECONNECT_TO_TANK })
  }

  public reconnectTankToPump() {
    this.pumpConn?.send({ action: RECONNECT_TO_PUMP })
  }

  public sendPumpSignal(signal: string) {
    this.pumpConn?.send({ action: signal })
  }

  sendTankSignal(signal: string, payload?: any) {
    this.tankConn?.send({ action: signal, payload })
  }
}
