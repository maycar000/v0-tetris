// Tetromino types
export type TETROMINO_TYPES = "I" | "J" | "L" | "O" | "S" | "T" | "Z"

// Tetromino shapes and colors
export const TETROMINOS: Record<TETROMINO_TYPES, { shape: number[][]; color: string }> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "cyan",
  },
  J: {
    shape: [
      [0, 2, 0],
      [0, 2, 0],
      [2, 2, 0],
    ],
    color: "blue",
  },
  L: {
    shape: [
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3],
    ],
    color: "orange",
  },
  O: {
    shape: [
      [4, 4],
      [4, 4],
    ],
    color: "yellow",
  },
  S: {
    shape: [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0],
    ],
    color: "green",
  },
  T: {
    shape: [
      [0, 0, 0],
      [6, 6, 6],
      [0, 6, 0],
    ],
    color: "purple",
  },
  Z: {
    shape: [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ],
    color: "red",
  },
}

// Get color for a tetromino by its value
export const getTetrominoColor = (value: number, rainbowMode = false): string => {
  const absValue = Math.abs(value)

  if (rainbowMode) {
    // In rainbow mode, cycle through colors based on time
    const hue = (absValue * 50 + Date.now() / 100) % 360
    return `bg-[hsl(${hue},70%,60%)] border-2 border-[hsl(${hue},80%,80%)] border-b-[hsl(${hue},60%,40%)] border-r-[hsl(${hue},60%,40%)]`
  }

  switch (absValue) {
    case 1: // I
      return "tetromino-i"
    case 2: // J
      return "tetromino-j"
    case 3: // L
      return "tetromino-l"
    case 4: // O
      return "tetromino-o"
    case 5: // S
      return "tetromino-s"
    case 6: // T
      return "tetromino-t"
    case 7: // Z
      return "tetromino-z"
    default:
      return "bg-gray-900"
  }
}

// Get shadow color for a tetromino by its value
export const getShadowColor = (value: number): string => {
  const absValue = Math.abs(value)

  switch (absValue) {
    case 1:
      return "tetromino-i-shadow"
    case 2:
      return "tetromino-j-shadow"
    case 3:
      return "tetromino-l-shadow"
    case 4:
      return "tetromino-o-shadow"
    case 5:
      return "tetromino-s-shadow"
    case 6:
      return "tetromino-t-shadow"
    case 7:
      return "tetromino-z-shadow"
    default:
      return "bg-transparent"
  }
}
