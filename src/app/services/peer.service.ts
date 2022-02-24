import { Injectable } from '@angular/core';
import * as Peer from 'peerjs';
import { REMOTE_SERVER } from './remote.service';

export const PeerMessage = {
  SERVER_OPEN: 'Connected to peer server',
  SERVER_CLOSE: 'Peer server connection closed',
  SERVER_DISCONNECT: 'Peer server connection disconnected',

  PEER_CONNECT: 'Peer connection connected',
  PEER_OPEN: 'Peer connection opened',
  PEER_ERROR: 'Peer connection error',
  PEER_CLOSE: 'Peer connection closed',
  PEER_DATA: 'Receive data'
}

@Injectable({
  providedIn: 'root'
})
export class PeerService {
  private isInit: boolean
  private myPeer: Peer
  private conns: Peer.DataConnection[] = []
  private id: string

  protected debug: boolean = false
  protected isServerOpen: boolean
  protected isServerError: boolean

  constructor() { }

  private initialize(id?: string) {
    this.id = id
    this.isServerOpen = false
    const isRemoteServer = localStorage.getItem(REMOTE_SERVER)
    try {
      if (id && isRemoteServer) this.myPeer = new Peer(id)
      else if(id) this.myPeer = new Peer(id, { host: '/', port: 80, 'path': '/peerjs' })
    } catch (error) {
      if (id && isRemoteServer) this.myPeer = new window['Peer'](id)
      else if(id) this.myPeer = new window['Peer'](id, { host: '/', port: 80, 'path': '/peerjs' })
    }

    // server events
    this.myPeer.on('open', id => console.info(PeerMessage.SERVER_OPEN, id)) // connected
    this.myPeer.on('open', () => this.isServerOpen = true) // connected
    this.myPeer.on('error', (e) => console.error(e.message))
    this.myPeer.on('error', (e: Error) => {
      if (e.message.endsWith('is taken'))
        this.isServerError = true
    })
    this.myPeer.on('close', () => console.warn(PeerMessage.SERVER_CLOSE))
    this.myPeer.on('disconnected', () => console.warn(PeerMessage.SERVER_DISCONNECT))
    // peer events
    this.myPeer.on('connection', conn => console.info(PeerMessage.PEER_CONNECT, conn.peer))
    this.myPeer.on('connection', conn => this.establishConnection(conn))
  }

  protected establishConnection(conn: Peer.DataConnection) {
    conn.on('open', () => this.conns.push(conn))
    conn.on('open', () => console.info('Connected to', conn.peer))
    conn.on('open', () => {
      conn.on('data', (data) => console.info('Received', data))
      conn.on('error', (e) => console.error(`Connection between ${conn.peer}`, e))
      conn.on('close', () => console.warn(`Connection between ${conn.peer} is closed`))
      conn.on('close', () => () => setTimeout(() => this.remove(conn), 1000))
    })
  }

  private remove(conn: Peer.DataConnection) {
    this.conns = this.conns.filter(c => c.peer !== conn.peer)
  }

  protected init(id?: string) {
    if (!this.isInit) this.initialize(id)
  }

  public get peer() { return this.myPeer }

  public reconnect(id?: string) {
    if (this.myPeer.disconnected) {
      this.initialize(id || this.id)
    }
  }

  public send(data: any) {
    this.conns.forEach(c => {
      console.info(`Sending ${data} to ${c.peer}`)
      c.send(data)
    })
  }

  public close() {
    this.conns.forEach(c => c.close())
    this.myPeer?.disconnect()
    this.myPeer?.destroy()
  }
}