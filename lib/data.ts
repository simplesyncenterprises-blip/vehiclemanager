import { Vehicle } from "../types/vehicle"

export const vehicles = [
  {
    id: "1",
    vehicleNumber: "HR26AB3300",
    ownerName: "Rohit",
    currentKM: 12500,
    insuranceExpiry: "2026-05-10",
    pollutionExpiry: "2026-06-01",
    rcExpiry: "2027-01-01",
    phone: "9876543210",


    
    services: [
      {
        id: "s1",
        serviceDate: "2026-05-01",
        kmAtService: 12000,
        engineOilChanged: true,
        oilType: "Motul 7100",
        fuelFilled: 500,
        partsReplaced: ["Brake Pads", "Air Filter"],
        labourCost: 800,
        partsCost: 1200,
        totalCost: 2000,
        notes: "Brake noise fixed"
      }
    ],
    fuelLogs: [
  {
    id: "f1",
    date: "2026-05-02",
    km: 12100,
    amount: 500,
    pumpName: "Indian Oil"
  }
]
    
  }
]