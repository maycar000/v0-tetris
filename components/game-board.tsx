import { getTetrominoColor, getShadowColor } from "../lib/tetrominos"

interface GameBoardProps {
  board: number[][]
  activePiece: {
    position: { x: number; y: number }
    tetromino: number[][]
    collided: boolean
  }
  visualPosition: { x: number; y: number }
  shadowPosition: { x: number; y: number }
  rainbowMode?: boolean
  bigMode?: boolean
}

export function GameBoard({
  board,
  activePiece,
  visualPosition,
  shadowPosition,
  rainbowMode = false,
  bigMode = false,
}: GameBoardProps) {
  // Create a board with the shadow piece
  const boardWithShadow = [...board.map((row) => [...row])]

  // Add shadow to the board
  if (activePiece.tetromino.length > 1) {
    activePiece.tetromino.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = y + shadowPosition.y
          const boardX = x + shadowPosition.x

          if (
            boardY >= 0 &&
            boardY < boardWithShadow.length &&
            boardX >= 0 &&
            boardX < boardWithShadow[0].length &&
            boardWithShadow[boardY][boardX] === 0
          ) {
            boardWithShadow[boardY][boardX] = -value - 100 // Use a special value for shadow
          }
        }
      })
    })
  }

  // Calculate the visual offset for smooth movement
  const visualOffsetX = (visualPosition.x - Math.floor(visualPosition.x)) * 100
  const visualOffsetY = (visualPosition.y - Math.floor(visualPosition.y)) * 100

  // Determine cell size based on bigMode
  const cellSizeClass = bigMode ? "w-8 h-8 sm:w-10 sm:h-10" : "w-6 h-6 sm:w-8 sm:h-8"

  return (
    <div className="relative bg-gray-900 border-2 border-gray-700 rounded-md overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      {/* Single grid overlay for the entire board */}
      <div className="absolute inset-0 grid-background pointer-events-none"></div>

      <div className="grid grid-cols-10 gap-0">
        {boardWithShadow.map((row, y) =>
          row.map((cell, x) => {
            const isShadow = cell < -100
            const cellValue = isShadow ? -(cell + 100) : Math.abs(cell)
            const isActive = cell < 0 && cell > -100

            // Check if this cell is part of the active piece
            const isPartOfActivePiece =
              isActive &&
              activePiece.tetromino.some((row, pieceY) => {
                return row.some((value, pieceX) => {
                  return (
                    value !== 0 &&
                    Math.floor(visualPosition.x) + pieceX === x &&
                    Math.floor(visualPosition.y) + pieceY === y
                  )
                })
              })

            // For active pieces, we'll apply the transform to the entire piece
            // This ensures all blocks in a piece move together
            return (
              <div
                key={`${y}-${x}`}
                className={`${cellSizeClass} ${
                  cellValue === 0
                    ? "bg-gray-900"
                    : isShadow
                      ? getShadowColor(cellValue)
                      : getTetrominoColor(cell, rainbowMode)
                } ${cellValue !== 0 ? "tetromino-block" : ""}`}
                style={
                  isPartOfActivePiece
                    ? {
                        transform: `translate(${visualOffsetX}%, ${visualOffsetY}%)`,
                        zIndex: 10,
                        transition: "transform 0.05s linear",
                      }
                    : undefined
                }
              />
            )
          }),
        )}
      </div>
    </div>
  )
}
