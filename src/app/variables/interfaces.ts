export interface PeerHost {
  ip: string
  port: string
}

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

export interface PumpStatus {
  isOnline: boolean
  isPumping: boolean
  isConnectedToTank: boolean
  isEnabledAutoPump: boolean
  isConnectingToTank: boolean
  tankConnectionText: string
  tankConnectionTextColor: string
  connectionText: string
  connectionTextColor: string
  pumpingText: string
  pumpingTextColor: string
  autoPumpingText: string
  autoPumpingTextColor: string
}