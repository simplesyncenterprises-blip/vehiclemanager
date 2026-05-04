"use client"

import { useState } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"

export default function AddVehicle() {
  const router = useRouter()
  
  const [vehicleNumber, setVehicleNumber] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phone, setPhone] = useState("")
  const [currentKM, setCurrentKM] = useState(0)
  const [insuranceExpiry, setInsuranceExpiry] = useState("")
  const [pollutionExpiry, setPollutionExpiry] = useState("")
  const [rcExpiry, setRcExpiry] = useState("")

  const handleAddVehicle = async () => {
    if (!vehicleNumber || !ownerName) {
      alert("Vehicle number and owner name required")
      return
    }

    await addDoc(collection(db, "vehicles"), {
  vehicleNumber: vehicleNumber.trim(),
  ownerName: ownerName.trim(),
  phoneNumber: phoneNumber.trim(),
  currentKM: Number(currentKM),
  insuranceExpiry,
  pollutionExpiry,
  rcExpiry,
  createdAt: serverTimestamp(),
})

    router.push("/dashboard")
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-6">Add Vehicle</h1>

      <div className="bg-white p-6 rounded-2xl shadow space-y-4 max-w-md">

        <input
          type="text"
          placeholder="Vehicle Number"
          className="uppercase w-full p-3 rounded-xl bg-zinc-800 text-white"
          onChange={(e) => setVehicleNumber(
    e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
  )
}
        />

        <input
          type="text"
          placeholder="Owner Name"
          className="uppercase w-full p-3 rounded-xl bg-zinc-800 text-white"
          onChange={(e) =>
  setOwnerName(
    e.target.value
      .toUpperCase()
      .replace(/[^A-Z ]/g, "")
  )
}
  />
                <input
  type="text"
  placeholder="Phone"
  value={phoneNumber}
  maxLength={10}
  inputMode="numeric"
  className="w-full border p-2 rounded"
  onChange={(e) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    setPhoneNumber(value)
  }}
/>

        <input
          type="number"
          placeholder="Current KM"
          className="w-full border p-2 rounded"
          onChange={(e) => setCurrentKM(Number(e.target.value))}
        />

        <label>Insurance Expiry</label>
        <input
          type="date"
          className="w-full border p-2 rounded"
          onChange={(e) => setInsuranceExpiry(e.target.value)}
        />

        <label>Pollution Expiry</label>
        <input
          type="date"
          className="w-full border p-2 rounded"
          onChange={(e) => setPollutionExpiry(e.target.value)}
        />

        <label>RC Expiry</label>
        <input
          type="date"
          className="w-full border p-2 rounded"
          onChange={(e) => setRcExpiry(e.target.value)}
        />

        <button
          onClick={handleAddVehicle}
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
        >
          Save Vehicle
        </button>
      </div>
    </main>
  )
}