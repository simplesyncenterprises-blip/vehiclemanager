"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { motion } from "framer-motion"
import Link from "next/link"
import type { Vehicle } from "@/types/vehicle"

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // ✅ DELETE VEHICLE
  const handleDeleteVehicle = async (vehicleId: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this vehicle?")

    if (!confirmDelete) return

    try {
      await deleteDoc(doc(db, "vehicles", vehicleId))

      // remove from UI immediately
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId))
    } catch (error) {
      console.error("Error deleting vehicle:", error)
    }
  }

  // 🔥 Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "vehicles"))

        const vehicleList: Vehicle[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Vehicle, "id">),
        }))

        

        setVehicles(vehicleList)
      } catch (error) {
        console.error("Error fetching vehicles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  // 🔎 Search
  const filteredVehicles = vehicles.filter((v) =>
    v.vehicleNumber?.toLowerCase().includes(search.toLowerCase())
  )

  

  // 📅 Expiry checker
  function getStatus(dateString?: string) {
    if (!dateString) return "safe"

    const today = new Date()
    const expiry = new Date(dateString)

    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)

    if (diffDays < 0) return "expired"
    if (diffDays <= 7) return "warning"
    return "safe"
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Loading vehicles...
      </main>
    )
  }

 return (
  <main className="min-h-screen bg-black p-10">

    {/* HEADER ROW */}
    <div className="flex items-center justify-between mb-8">
      
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-white"
      >
        Vehicle Dashboard
      </motion.h1>

      {/* SEARCH BAR - Top Right */}
      <input
        type="text"
        placeholder="Search by vehicle number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-64 p-2.5 rounded-xl bg-zinc-800 text-white 
                   border border-zinc-700 focus:outline-none 
                   focus:ring-2 focus:ring-green-600 transition"
      />

    </div>

    {/* Add Vehicle */}
    <Link
      href="/dashboard/add-vehicle"
      className="inline-block mb-6 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
    >
      + Add Vehicle
    </Link>

      
      {/* Grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.15 } },
        }}
        className="grid gap-6 md:grid-cols-3"
      >
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle) => {
            const hasExpired = [
              vehicle.insuranceExpiry,
              vehicle.pollutionExpiry,
              vehicle.rcExpiry,
            ].some((date) => getStatus(date) === "expired")

            return (<motion.div
  key={vehicle.id}
  variants={{
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 },
  }}
  transition={{ duration: 0.4 }}
  whileHover={{ scale: 1.03 }}
  className={`relative group bg-zinc-900 text-white p-6 rounded-2xl shadow-lg border ${
    hasExpired ? "border-red-600" : "border-zinc-800"
  }`}
>
  
  {/* ❌ DELETE BUTTON (Appears on Hover)*/}
<button
  onClick={(e) => {
    e.stopPropagation()
    e.preventDefault()
    handleDeleteVehicle(vehicle.id)
  }}
  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition 
             text-zinc-400 hover:text-red-500 text-xl font-bold"
>
  ×
</button>

  {/* CARD CONTENT */}
  <Link href={`/dashboard/vehicles/${vehicle.id}`}>
    <div className="cursor-pointer">
      <h2 className="text-xl font-semibold">
        {vehicle.vehicleNumber}
      </h2>

      <p className="text-zinc-400">{vehicle.ownerName}</p>

      <p className="mt-2 text-sm">
        Current KM:{" "}
        <span className="font-medium">
          {vehicle.currentKM}
        </span>
      </p>

      <div className="mt-4 text-sm space-y-2">
        {["insuranceExpiry", "pollutionExpiry", "rcExpiry"].map(
          (field) => {
            const value =
              vehicle[field as keyof Vehicle] as string
            const status = getStatus(value)

            return (
              <div
                key={field}
                className="flex justify-between items-center"
              >
                <span className="capitalize">
                  {field.replace("Expiry", "")}: {value}
                </span>

                {status === "expired" && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    Expired
                  </span>
                )}

                {status === "warning" && (
                  <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
                    Expiring Soon
                  </span>
                )}
              </div>
            )
          }
        )}
      </div>
    </div>
  </Link>
</motion.div>
            )
          })
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500 text-lg">
            No vehicle found 🚫
          </div>
        )}
      </motion.div>
    </main>
  )
}