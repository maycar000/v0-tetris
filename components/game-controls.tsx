"use client"

interface GameControlsProps {
  onStart: () => void
  onLeft: () => void
  onStopLeft: () => void
  onRight: () => void
  onStopRight: () => void
  onRotate: () => void
  onSoftDrop: () => void
  onStopSoftDrop: () => void
  onHardDrop: () => void
  onPause: () => void
  onHold: () => void
  gameStarted: boolean
  gameOver: boolean
  isPaused: boolean
  canHold: boolean
}

export function GameControls({
  onStart,
  onLeft,
  onStopLeft,
  onRight,
  onStopRight,
  onRotate,
  onSoftDrop,
  onStopSoftDrop,
  onHardDrop,
  onPause,
  onHold,
  gameStarted,
  gameOver,
  isPaused,
  canHold,
}: GameControlsProps) {
  return (
    <div className="bg-gray-800 rounded-md p-4 text-white shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-center nes-title">Controls</h2>

      <div className="space-y-4">
        {(!gameStarted || gameOver) && (
          <button
            onClick={onStart}
            className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg nes-text"
          >
            {gameOver ? "Play Again" : "Start Game"}
          </button>
        )}

        {gameStarted && !gameOver && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <button
                onMouseDown={onLeft}
                onMouseUp={onStopLeft}
                onMouseLeave={onStopLeft}
                onTouchStart={onLeft}
                onTouchEnd={onStopLeft}
                disabled={isPaused}
                className="py-2 px-4 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
              >
                ←
              </button>
              <button
                onClick={onRotate}
                disabled={isPaused}
                className="py-2 px-4 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
              >
                ↻
              </button>
              <button
                onMouseDown={onRight}
                onMouseUp={onStopRight}
                onMouseLeave={onStopRight}
                onTouchStart={onRight}
                onTouchEnd={onStopRight}
                disabled={isPaused}
                className="py-2 px-4 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
              >
                →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onMouseDown={onSoftDrop}
                onMouseUp={onStopSoftDrop}
                onMouseLeave={onStopSoftDrop}
                onTouchStart={onSoftDrop}
                onTouchEnd={onStopSoftDrop}
                disabled={isPaused}
                className="py-2 px-4 bg-yellow-600 text-white font-bold rounded-md hover:bg-yellow-700 transition-all duration-200 disabled:opacity-50"
              >
                Soft Drop ↓
              </button>
              <button
                onClick={onHardDrop}
                disabled={isPaused}
                className="py-2 px-4 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-all duration-200 disabled:opacity-50"
              >
                Hard Drop ⇓
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onHold}
                disabled={isPaused || !canHold}
                className="py-2 px-4 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-700 transition-all duration-200 disabled:opacity-50"
              >
                Hold (C)
              </button>
              <button
                onClick={onPause}
                className="py-2 px-4 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-all duration-200"
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
            </div>
          </>
        )}

        <div className="text-sm text-gray-400 mt-4 nes-text">
          <p className="mb-1">Keyboard Controls:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Arrow Keys: Move & Rotate</li>
            <li>Down Arrow: Soft Drop</li>
            <li>Space: Hard Drop</li>
            <li>P: Pause/Resume</li>
            <li>C: Hold Piece</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
