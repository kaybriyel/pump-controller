import { Injectable } from '@angular/core';
import * as Peer from 'peerjs';
import { PeerHost } from '../variables/interfaces';
import { PeerMessage, PEER_HOST, REMOTE_SERVER } from '../variables/string';

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
    const isRemoteServer = localStorage.getItem(REMOTE_SERVER) === 'true' ? true : false
    try {
      if (id && isRemoteServer) this.myPeer = new Peer(id)
      else if(id) this.myPeer = new Peer(id, { host: '/', port: 80, 'path': '/peerjs' })
    } catch (error) {
      if (id && isRemoteServer) this.myPeer = new window['Peer'](id)
      else if(id) {
        const _peerHost = localStorage.getItem(PEER_HOST)
        let host, port
        if(_peerHost) {
          const peerHost = JSON.parse(_peerHost) as PeerHost
          host = peerHost.ip
          port = peerHost.port
        }
        if(!host) host = '/'
        if(!port) port = location.port || 80
        this.myPeer = new window['Peer'](id, { host, port, 'path': '/peerjs' })
        setTimeout(() => {
          if(!this.isServerOpen)
            this.close()
        }, 8000)
      }
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