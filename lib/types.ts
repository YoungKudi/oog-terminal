export interface User {
  id: string
  name: string
  email: string
  userId: string
  phone: string
  role: 'user' | 'officer'
  createdAt: string
  updatedAt: string
}

export interface Container {
  id: string
  containerNumber: string
  position: string
  size: string
  type: string
  equipment: string
  auxCargo: string
  auxCargoType: string
  auxCargoQuantity: number
  vessel: string
  arrivalDate: string
  remarks: string
  receivedDate: string
  userId: string
  devanningAttempts: number
  lastDevanningAttempt: string
}

export interface DevanningQueue {
  id: string
  containerNumber: string
  size: string
  type: string
  position: string
  equipment: string
  auxCargo: string
  auxCargoType: string
  auxCargoQuantity: number
  vessel: string
  arrivalDate: string
  agency: string
  devanningType: string
  remarks: string
  status: string
  devanningStatus: 'in_stack' | 'breaking' | 'positioned' | 'unlashing' | 'ready_to_drop'
  step_breaking: boolean
  step_breaking_at: string
  step_positioned: boolean
  step_positioned_at: string
  step_unlashing: boolean
  step_unlashing_at: string
  step_ready_to_drop: boolean
  step_ready_to_drop_at: string
  fuelNeeded: boolean
  electricalFault: boolean
  mechanicalFault: boolean
  fuel_resolved: boolean
  fuel_resolved_at: string
  fuel_resolved_by: string
  electrical_resolved: boolean
  electrical_resolved_at: string
  electrical_resolved_by: string
  mechanical_resolved: boolean
  mechanical_resolved_at: string
  mechanical_resolved_by: string
  damageRemarks: string
  bookedDate: string
  expired: boolean
  expiredAt: string
  movedToDevanAt: string
  userId: string
}

export interface UnstuffedContainer {
  id: string
  containerNumber: string
  size: string
  type: string
  position: string
  equipment: string
  auxCargo: string
  auxCargoType: string
  auxCargoQuantity: number
  vessel: string
  arrivalDate: string
  agency: string
  devanningType: string
  remarks: string
  unstuffedAt: string
  userId: string
}

export interface Location {
  id: string
  name: string
  positions: string[]
  type: string
  prefix: string
  columns: number
  rows: number
}

export interface EvacuationRecord {
  id: string
  containerNumber: string
  size: string
  type: string
  position: string
  equipment: string
  vessel: string
  arrivalDate: string
  auxCargo: string
  devanningType: string
  evacuatedAt: string
  userId: string
}

export interface LoadoutRecord {
  id: string
  containerNumber: string
  size: string
  type: string
  equipment: string
  vessel: string
  arrivalDate: string
  unstuffedDate: string
  deliveryDate: string
  location: string
  content: string
  truckPlate: string
  agentContact: string
  boxesLoaded: number
  devanningType: string
  remarks: string
  clearedAt: string
  userId: string
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  containerNumber: string
  details: string
  createdAt: string
}
