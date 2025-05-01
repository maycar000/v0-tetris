"use client"

interface PauseModalProps {
  onResume: () => void
}

export function PauseModal({ onResume }: PauseModalProps) {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700 shadow-[0_0_30px_rgba(0,0,0,0.7)]">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Game Paused</h2>

        <button
          onClick={onResume}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-md hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
        >
          Resume Game
        </button>

        <p className="text-gray-400 text-center mt-4">Press P to resume</p>
      </div>
    </div>
  )
}
