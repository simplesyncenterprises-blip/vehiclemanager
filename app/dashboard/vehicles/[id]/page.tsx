"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Vehicle, Service, FuelLog } from "@/types/vehicle"

export default function VehicleDetail() {
  const params = useParams()
  const id = params?.id as string

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([])
  const [loading, setLoading] = useState(true)  

  const [showServiceForm, setShowServiceForm] = useState(false)
  const [showFuelForm, setShowFuelForm] = useState(false)

  const [newService, setNewService] = useState({
    serviceDate: "",
    kmAtService: 0,
    oilType: "",
    partsReplaced: "",
    labourCost: 0,
    partsCost: 0,
    notes: "",
  })

  const [newFuel, setNewFuel] = useState({
  date: "",
  km: 0,
  liters: 0,
  pumpName: "",
})
  // 🔥 Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const vehicleRef = doc(db, "vehicles", id)
        const vehicleSnap = await getDoc(vehicleRef)

        if (!vehicleSnap.exists()) {
          setVehicle(null)
          setLoading(false)
          return
        }

        setVehicle({
          id: vehicleSnap.id,
          ...vehicleSnap.data(),
        } as Vehicle)

        // Services
        const servicesSnapshot = await getDocs(
          collection(db, "vehicles", id, "services")
        )

        const serviceList: Service[] = servicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Service[]

        setServices(serviceList)

        // Fuel Logs
        const fuelSnapshot = await getDocs(
          collection(db, "vehicles", id, "fuelLogs")
        )

        const fuelList: FuelLog[] = fuelSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FuelLog[]

        setFuelLogs(fuelList)

        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id])

  if (loading) return <div className="p-10">Loading...</div>
  if (!vehicle) return <div className="p-10">Vehicle not found</div>

  // 🔥 Add Service
  const handleAddService = async () => {
    const total = newService.labourCost + newService.partsCost

    const serviceData = {
      serviceDate: newService.serviceDate,
      kmAtService: newService.kmAtService,
      engineOilChanged: true,
      oilType: newService.oilType,
      fuelFilled: 0,
      partsReplaced: newService.partsReplaced
        ? newService.partsReplaced.split(",").map((p) => p.trim())
        : [],
      labourCost: newService.labourCost,
      partsCost: newService.partsCost,
      totalCost: total,
      notes: newService.notes,
    }

    const docRef = await addDoc(
      collection(db, "vehicles", id, "services"),
      serviceData
    )

    await updateDoc(doc(db, "vehicles", id), {
      currentKM: newService.kmAtService,
    })

    setServices([...services, { id: docRef.id, ...serviceData } as Service])
    setVehicle({ ...vehicle, currentKM: newService.kmAtService })
    setShowServiceForm(false)
  }

  // 🔥 Add Fuel
  const handleAddFuel = async () => {
  let distance = 0
  let mileage = 0

  if (fuelLogs.length > 0) {
    // Sort logs by KM descending (latest first)
    const sortedLogs = [...fuelLogs].sort((a, b) => b.km - a.km)
    const lastFuel = sortedLogs[0]

    distance = newFuel.km - lastFuel.km

    if (newFuel.liters > 0 && distance > 0) {
      mileage = Number((distance / newFuel.liters).toFixed(2))
    }
  }

  const fuelData = {
    date: newFuel.date,
    km: newFuel.km,
    liters: newFuel.liters,
    pumpName: newFuel.pumpName,
    distance,
    mileage,
  }

  const docRef = await addDoc(
    collection(db, "vehicles", id, "fuelLogs"),
    fuelData
  )

  setFuelLogs([...fuelLogs, { id: docRef.id, ...fuelData }])
  setShowFuelForm(false)

  // reset form
  setNewFuel({
    date: "",
    km: 0,
    liters: 0,
    pumpName: "",
  })
}

  // 🔥 Delete Service
  const handleDeleteService = async (serviceId: string) => {
    await deleteDoc(doc(db, "vehicles", id, "services", serviceId))
    setServices(services.filter((s) => s.id !== serviceId))
  }

  // 🔥 Delete Fuel
  const handleDeleteFuel = async (fuelId: string) => {
    await deleteDoc(doc(db, "vehicles", id, "fuelLogs", fuelId))
    setFuelLogs(fuelLogs.filter((f) => f.id !== fuelId))
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-3xl font-bold mb-6">
        {vehicle.vehicleNumber}
      </h1>

      {/* BASIC INFO */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <p>Owner: {vehicle.ownerName}</p>
<p>Phone: {vehicle.phoneNumber}</p>
<p>Current KM: {vehicle.currentKM}</p>
      </div>

      {/* SERVICE SECTION */}
      <button
        onClick={() => setShowServiceForm(!showServiceForm)}
        className="mb-4 bg-black text-white px-4 py-2 rounded-xl"
      >
        {showServiceForm ? "Cancel" : "Add Service"}
      </button>

      {showServiceForm && (
        <div className="bg-white p-6 rounded-2xl shadow mb-6 space-y-3">
          <input type="date" className="w-full border p-2 rounded"
            onChange={(e) =>
              setNewService({ ...newService, serviceDate: e.target.value })
            }
          />
          <input type="number" placeholder="KM"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setNewService({ ...newService, kmAtService: Number(e.target.value) })
            }
          />
          <input type="text" placeholder="Oil Type"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setNewService({ ...newService, oilType: e.target.value })
            }
          />
          <input type="text" placeholder="Parts (comma separated)"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setNewService({ ...newService, partsReplaced: e.target.value })
            }
          />
          <input type="number" placeholder="Labour Cost"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setNewService({ ...newService, labourCost: Number(e.target.value) })
            }
          />
          <input type="number" placeholder="Parts Cost"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setNewService({ ...newService, partsCost: Number(e.target.value) })
            }
          />
          <button
            onClick={handleAddService}
            className="bg-green-600 text-white px-4 py-2 rounded-xl"
          >
            Save Service
          </button>
        </div>
      )}

     {/* SERVICE LIST */}
<div className="bg-white p-6 rounded-2xl shadow mb-6">
  <h2 className="text-xl font-semibold mb-4">Service History</h2>

  {services.length === 0 && (
    <p className="text-gray-500">No services recorded yet.</p>
  )}

  {services.map((service) => (
    <div
      key={service.id}
      className="border rounded-2xl p-5 mb-4 bg-gray-50 shadow-sm"
    >
      {/* Top Row */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg">
          Service on {service.serviceDate}
        </h3>

        <span className="text-sm text-gray-500">
          KM: {service.kmAtService}
        </span>
      </div>

      {/* Engine Oil */}
      <div className="mb-2">
        <p className="font-medium">Engine Oil:</p>
        <p className="text-gray-600">
          {service.engineOilChanged
            ? `Changed (${service.oilType})`
            : "Not Changed"}
        </p>
      </div>

      {/* Parts Replaced */}
      <div className="mb-2">
        <p className="font-medium">Parts Replaced:</p>

        {service.partsReplaced?.length > 0 ? (
          <ul className="list-disc list-inside text-gray-600">
            {service.partsReplaced.map((part, index) => (
              <li key={index}>{part}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No parts replaced</p>
        )}
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
        <p>Labour Cost:</p>
        <p className="text-right">₹{service.labourCost}</p>

        <p>Parts Cost:</p>
        <p className="text-right">₹{service.partsCost}</p>

        <p className="font-semibold">Total:</p>
        <p className="text-right font-semibold">
          ₹{service.totalCost}
        </p>
      </div>

      {/* Notes */}
      {service.notes && (
        <div className="mt-3 bg-yellow-50 p-3 rounded-xl">
          <p className="text-sm text-gray-700">
            📝 {service.notes}
          </p>
        </div>
      )}

      <button
        onClick={() => handleDeleteService(service.id)}
        className="mt-4 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
      >
        Delete Service
      </button>
    </div>
  ))}
</div>

      {/* FUEL SECTION */}
      <button
        onClick={() => setShowFuelForm(!showFuelForm)}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        {showFuelForm ? "Cancel" : "Add Fuel Log"}
      </button>

      {showFuelForm && (
        <div className="bg-white p-6 rounded-2xl shadow mb-6 space-y-3">
          <input type="date" className="w-full border p-2 rounded"
            onChange={(e) =>
              setNewFuel({ ...newFuel, date: e.target.value })
            }
          />
          <input type="number" placeholder="KM"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setNewFuel({ ...newFuel, km: Number(e.target.value) })
            }
          />
          <input
  type="number"
  placeholder="Liters"
  className="w-full border p-2 rounded"
  onChange={(e) =>
    setNewFuel({ ...newFuel, liters: Number(e.target.value) })
  }
/>
          <input type="text" placeholder="Pump Name"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setNewFuel({ ...newFuel, pumpName: e.target.value })
            }
          />
          <button
            onClick={handleAddFuel}
            className="bg-green-600 text-white px-4 py-2 rounded-xl"
          >
            Save Fuel
          </button>
        </div>
      )}

      {/* FUEL LIST */}
<div className="bg-white p-6 rounded-2xl shadow">
  <h2 className="text-xl font-semibold mb-4">Fuel Logs</h2>

  {fuelLogs.length === 0 ? (
    <p className="text-gray-500">No fuel logs yet.</p>
  ) : (
    fuelLogs
      .sort((a, b) => b.km - a.km) // latest first
      .map((fuel) => (
        <div key={fuel.id} className="border p-4 rounded mb-3 bg-gray-50">
          <p><strong>Date:</strong> {fuel.date}</p>
          <p><strong>KM:</strong> {fuel.km}</p>
          <p><strong>Liters:</strong> {fuel.liters}</p>

          {fuel.distance && fuel.distance > 0 ? (
            <>
              <p><strong>Distance Driven:</strong> {fuel.distance} km</p>
              <p className="text-green-600 font-semibold">
                Mileage: {fuel.mileage} km/L
              </p>
            </>
          ) : (
            <p className="text-gray-400 text-sm">
              First top-up (no previous data)
            </p>
          )}

          <button
            onClick={() => handleDeleteFuel(fuel.id)}
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      ))
  )}
</div>
    </main>
  )
}