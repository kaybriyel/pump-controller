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
export const PEER_HOST = 'PEER_HOST'

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