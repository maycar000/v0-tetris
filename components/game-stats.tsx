interface GameStatsProps {
  score: number
  level: number
  lines: number
  highScore: number
  godMode?: boolean
  speedMode?: boolean
  bigMode?: boolean
}

export function GameStats({ score, level, lines, highScore, godMode, speedMode, bigMode }: GameStatsProps) {
  return (
    <div className="bg-gray-800 rounded-md p-4 text-white shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-center nes-title">Stats</h2>

      <div className="space-y-2 nes-text">
        <div className="flex justify-between">
          <span className="text-gray-400">Score:</span>
          <span className="font-mono text-cyan-400">{score.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">High Score:</span>
          <span className="font-mono text-yellow-400">{highScore.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Level:</span>
          <span className="font-mono text-purple-400">{level}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Lines:</span>
          <span className="font-mono text-green-400">{lines}</span>
        </div>

        {/* Active cheats indicators */}
        {(godMode || speedMode || bigMode) && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-xs text-center font-bold text-red-400">Active Cheats:</div>
            <div className="flex flex-wrap gap-1 mt-1 justify-center">
              {godMode && <span className="text-xs bg-red-900 px-1 rounded">God</span>}
              {speedMode && <span className="text-xs bg-blue-900 px-1 rounded">Speed</span>}
              {bigMode && <span className="text-xs bg-green-900 px-1 rounded">Big</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
