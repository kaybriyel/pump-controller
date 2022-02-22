import { Injectable } from '@angular/core';
import * as Peer from 'peerjs';
import { PeerService } from './peer.service';
import { PumpService, PumpStatus } from './pump.service';

@Injectable({
  providedIn: 'root'
})
export class RemoteService extends PeerService {

  private pumpConn: Peer.DataConnection
  private tankConn: Peer.DataConnection
  
  private _pumpStatus: PumpStatus
  private _tankStatus: PumpService

  private isPumpConnOpen: boolean;
  private isTankConnOpen: boolean;

  public get isOnline() { return this.isServerOpen && !this.peer.disconnected }
  public get isConnectingToServer() { return (!this.isServerOpen && !this.peer.disconnected) }
  public get isConnectedToPump() { return this.pumpConn && this.isPumpConnOpen }
  public get isConnectingToPump() { return this.pumpConn && !this.isPumpConnOpen }

  public get connectionText() { return this.isOnline ? 'Connected' : this.isConnectingToServer ? 'Connecting' : 'Disconnected' }
  public get connectionTextColor() { return this.isOnline ? 'success' : this.isConnectingToServer ? 'warning' : 'danger' }
  public get pumpConnectionText() { return this.isConnectingToPump ? 'Connecting' : this.isConnectedToPump ? 'Connected' : 'Disconnected' }
  public get pumpConnectionTextColor() { return this.isConnectingToPump ? 'warning' : this.isConnectedToPump ? 'success' : 'danger' }

  public get isConnectedToTank() { return this.tankConn && this.isTankConnOpen }
  public get isConnectingToTank() { return this.tankConn && !this.isTankConnOpen }

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
        this.establishTankConnection(conn)
      }
    })
    super.peer.on('error', (e: Error) => {
      if (e.message.startsWith('Could not connect to peer')) {
        this.pumpConn = null
      }
    })
    window['remoteService'] = this
  }

  public reconnectToPump() {
    if (!this.isConnectedToPump) {
      if (this.debug) console.log('connecting to pump')
      this.isPumpConnOpen = false
      const conn = super.peer.connect('unique-pump-id')
      super.establishConnection(conn)
      this.establishPumpConnection(conn)
    }
  }

  public reconnectToTank() {
    if (!this.isConnectedToTank) {
      if (this.debug) console.log('connecting to tank')
      this.isTankConnOpen = false
      const conn = super.peer.connect('unique-tank-id')
      super.establishConnection(conn)
      this.establishTankConnection(conn)
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

  private establishTankConnection(conn) {
    conn.on('open', () => {
      this.tankConn = conn
      this.isTankConnOpen = true
      this.tankConn.on('close', () => setTimeout(() => this.tankConn = null, 1000))
      this.tankConn.on('close', () => this._tankStatus = null)
      this.tankConn.on('close', () => this.debug ? console.info('Tank connection closed') : null)
      this.tankConn.on('error', (e) => this.debug ? console.error('Tank connection error', e) : null)
      this.tankConn.on('error', () => setTimeout(() => this.tankConn = null, 1000))
      this.tankConn.on('error', () => this._tankStatus = null)
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
      else if (data.action === 'status') {
        if (this.debug) console.info('received action', data.action)
        if (this.debug) console.info('sending', this.status)
        this.tankConn?.send({ payload: this.status })
      }
    })
    const i = setInterval(() => this.tankConn?.send({ action: 'status' }), 5000)
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
      else if (data.action === 'status') {
        if (this.debug) console.info('received action', data.action)
        if (this.debug) console.info('sending', this.status)
        this.pumpConn.send({ payload: this.status })
      }
    })
    const i = setInterval(() => this.pumpConn?.send({ action: 'status' }), 5000)
    this.pumpConn.on('close', () => clearInterval(i))
    this.pumpConn.on('error', () => clearInterval(i))
  }
}
