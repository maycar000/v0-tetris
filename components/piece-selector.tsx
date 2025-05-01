"use client"

import { TETROMINOS, type TETROMINO_TYPES } from "../lib/tetrominos"
import { getTetrominoColor } from "../lib/tetrominos"

interface PieceSelectorProps {
  onSelect: (piece: TETROMINO_TYPES) => void
}

export function PieceSelector({ onSelect }: PieceSelectorProps) {
  const pieces = Object.keys(TETROMINOS) as TETROMINO_TYPES[]

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700 shadow-[0_0_30px_rgba(0,0,0,0.7)]">
        <h2 className="text-2xl font-bold text-white mb-6 text-center nes-title">Choose a Piece</h2>

        <div className="grid grid-cols-4 gap-4">
          {pieces.map((pieceType) => (
            <button
              key={pieceType}
              onClick={() => onSelect(pieceType)}
              className="bg-gray-700 p-2 rounded-md hover:bg-gray-600 transition-all duration-200 flex items-center justify-center"
            >
              <div
                className="grid grid-flow-row gap-[1px]"
                style={{
                  gridTemplateColumns: `repeat(${TETROMINOS[pieceType].shape[0].length}, minmax(0, 1fr))`,
                }}
              >
                {TETROMINOS[pieceType].shape.map((row, y) =>
                  row.map((cell, x) => (
                    <div
                      key={`${y}-${x}`}
                      className={`w-4 h-4 ${cell === 0 ? "bg-transparent" : getTetrominoColor(cell)} ${
                        cell !== 0 ? "tetromino-block" : ""
                      }`}
                    />
                  )),
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
