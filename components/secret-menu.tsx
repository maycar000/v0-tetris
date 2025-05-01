"use client"

interface SecretMenuProps {
  onClose: () => void
}

export function SecretMenu({ onClose }: SecretMenuProps) {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700 shadow-[0_0_30px_rgba(0,0,0,0.7)]">
        <h2 className="text-2xl font-bold text-white mb-6 text-center nes-title">Secret Cheats</h2>

        <div className="space-y-4 text-gray-300">
          <div className="border-b border-gray-700 pb-2">
            <h3 className="font-bold text-blue-400">Konami Code</h3>
            <p className="text-sm">↑↑↓↓←→←→ba - Level up</p>
          </div>

          <div className="border-b border-gray-700 pb-2">
            <h3 className="font-bold text-green-400">Text Cheats</h3>
            <ul className="text-sm space-y-1">
              <li>
                <span className="text-yellow-400">level</span> - Increase level
              </li>
              <li>
                <span className="text-yellow-400">score</span> - Add 10,000 points
              </li>
              <li>
                <span className="text-yellow-400">clear</span> - Clear the board
              </li>
              <li>
                <span className="text-yellow-400">piece</span> - Choose next piece
              </li>
              <li>
                <span className="text-yellow-400">rainbow</span> - Toggle rainbow mode
              </li>
              <li>
                <span className="text-yellow-400">god</span> - Toggle god mode (no collisions)
              </li>
              <li>
                <span className="text-yellow-400">speed</span> - Toggle speed mode
              </li>
              <li>
                <span className="text-yellow-400">big</span> - Toggle big blocks
              </li>
              <li>
                <span className="text-yellow-400">custom</span> - Set custom values
              </li>
              <li>
                <span className="text-yellow-400">menu</span> - Show this menu
              </li>
            </ul>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-700 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
