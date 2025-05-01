"use client"

interface GameOverModalProps {
  score: number
  highScore: number
  onRestart: () => void
}

export function GameOverModal({ score, highScore, onRestart }: GameOverModalProps) {
  const isNewHighScore = score >= highScore && score > 0

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700 shadow-[0_0_30px_rgba(0,0,0,0.7)]">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Game Over</h2>

        <div className="my-6 text-center">
          <p className="text-gray-400 mb-2">Your score:</p>
          <p className="text-4xl font-bold text-cyan-400">{score.toLocaleString()}</p>

          {isNewHighScore && <p className="text-yellow-400 font-bold mt-2 animate-pulse">New High Score!</p>}

          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-gray-400">High Score:</p>
            <p className="text-2xl font-bold text-yellow-400">{highScore.toLocaleString()}</p>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}
