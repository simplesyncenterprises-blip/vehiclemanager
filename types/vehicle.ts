export interface Service {
  id: string
  serviceDate: string
  kmAtService: number
  engineOilChanged: boolean
  oilType: string
  fuelFilled: number
  partsReplaced: string[]
  labourCost: number
  partsCost: number
  totalCost: number
  notes: string
}

export interface FuelLog {
  id: string
  date: string
  km: number
  liters: number
  pumpName: string
  distance?: number
  mileage?: number
}

export interface Vehicle {
  id: string
  vehicleNumber: string
  ownerName: string
  phoneNumber: string
  currentKM: number
  insuranceExpiry?: string
  pollutionExpiry?: string
  rcExpiry?: string
  createdAt?: string
}