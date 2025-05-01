// Create an empty board
export const createEmptyBoard = () => {
  return Array.from({ length: 20 }, () => Array(10).fill(0))
}

// Create a board with the active piece
export const createBoard = (
  previousBoard: number[][],
  activePiece: {
    position: { x: number; y: number }
    tetromino: number[][]
    collided: boolean
  },
) => {
  // First, create a new board from the previous state
  const board = previousBoard.map((row) => row.map((cell) => (cell < 0 ? 0 : cell)))

  // Then, draw the active tetromino
  activePiece.tetromino.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const boardY = y + activePiece.position.y
        const boardX = x + activePiece.position.x

        if (boardY >= 0 && boardY < board.length && boardX >= 0 && boardX < board[0].length) {
          board[boardY][boardX] = activePiece.collided ? value : -value
        }
      }
    })
  })

  return board
}

// Update the checkCollision function to be more robust:
export const checkCollision = (tetromino: number[][], position: { x: number; y: number }, board: number[][]) => {
  // Ensure we have valid inputs
  if (!tetromino || !position || !board) return true

  for (let y = 0; y < tetromino.length; y++) {
    for (let x = 0; x < tetromino[y].length; x++) {
      // Skip empty cells in the tetromino
      if (tetromino[y][x] !== 0) {
        const boardY = y + position.y
        const boardX = x + position.x

        // Check if the tetromino is outside the board boundaries
        if (boardX < 0 || boardX >= board[0].length || boardY >= board.length) {
          return true
        }

        // Check if we've hit the bottom of the board
        if (boardY >= board.length) {
          return true
        }

        // Check if the tetromino collides with a non-empty cell on the board
        // Only check cells that are within the board
        if (boardY >= 0 && board[boardY] && board[boardY][boardX] > 0) {
          return true
        }
      }
    }
  }

  return false
}

// Function to sweep completed rows
export const sweepRows = (board: number[][]): number[][] => {
  const newBoard = board.filter((row) => row.some((cell) => cell === 0) || row.every((cell) => cell === 0))
  const rowsCleared = board.length - newBoard.length
  const emptyRows = Array.from({ length: rowsCleared }, () => new Array(board[0].length).fill(0))
  return [...emptyRows, ...newBoard]
}
