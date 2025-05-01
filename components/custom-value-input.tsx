"use client"

import type React from "react"

import { useState } from "react"

interface CustomValueInputProps {
  type: string
  onSubmit: (type: string, value: number) => void
  currentValue: number
}

export function CustomValueInput({ type, onSubmit, currentValue }: CustomValueInputProps) {
  const [value, setValue] = useState(currentValue.toString())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numValue = Number.parseInt(value, 10)
    if (!isNaN(numValue)) {
      onSubmit(type, numValue)
    }
  }

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700 shadow-[0_0_30px_rgba(0,0,0,0.7)]">
        <h2 className="text-2xl font-bold text-white mb-6 text-center nes-title">
          Set Custom {type.charAt(0).toUpperCase() + type.slice(1)}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="customValue" className="block text-sm font-medium text-gray-300 mb-2">
              Enter value:
            </label>
            <input
              type="number"
              id="customValue"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-all duration-200"
          >
            Set Value
          </button>
        </form>
      </div>
    </div>
  )
}
