import { getTetrominoColor } from "../lib/tetrominos"

interface HeldPieceDisplayProps {
  piece: {
    shape: number[][]
    color: string
  } | null
  canHold: boolean
}

export function HeldPieceDisplay({ piece, canHold }: HeldPieceDisplayProps) {
  // Determine piece type for special handling
  const isIPiece = piece && piece.shape[0].length === 4
  const isOPiece = piece && piece.shape.length === 2 && piece.shape[0].length === 2
  const isTPiece = piece && piece.shape.some((row) => row.includes(6))

  return (
    <div
      className={`bg-gray-800 rounded-md p-4 text-white shadow-lg border border-gray-700 ${!canHold ? "opacity-50" : ""}`}
    >
      <h2 className="text-xl font-bold mb-4 text-center nes-title">Hold</h2>

      <div className="flex justify-center items-center h-24">
        {piece ? (
          <div className="flex items-center justify-center w-24 h-24">
            <div
              className={`grid grid-flow-row gap-[1px]`}
              style={{
                gridTemplateColumns: `repeat(${piece.shape[0].length}, minmax(0, 1fr))`,
                transform: isIPiece
                  ? "scale(0.65) translateY(8px)"
                  : isTPiece
                    ? "translateY(8px)"
                    : isOPiece
                      ? "scale(0.9)"
                      : "translateY(4px)",
                transformOrigin: "center center",
              }}
            >
              {piece.shape.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    className={`w-6 h-6 ${cell === 0 ? "bg-transparent" : getTetrominoColor(cell)} ${
                      cell !== 0 ? "tetromino-block" : ""
                    }`}
                  />
                )),
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-sm nes-text">Empty</div>
        )}
      </div>
    </div>
  )
}
