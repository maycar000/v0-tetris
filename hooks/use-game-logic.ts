"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { TETROMINOS, type TETROMINO_TYPES } from "../lib/tetrominos"
import { checkCollision } from "../lib/game-helpers"

// Export the constants so they can be used in other components
export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20
const INITIAL_DROP_TIME = 1000
const SPEED_INCREASE_INTERVAL = 30000 // Speed increases every 30 seconds
const SPEED_INCREASE_FACTOR = 0.9 // Each increase makes the game 10% faster
const MOVE_REPEAT_DELAY = 50 // Delay between repeated moves (ms)
const MOVE_SPEED = 0.15 // How fast pieces move (grid cells per frame)
const SOFT_DROP_SPEED = 0.4 // How fast pieces soft drop (grid cells per frame)

// Create an empty board
const createEmptyBoard = () => {
  return Array.from({ length: 20 }, () => Array(10).fill(0))
}

// Secret cheat codes
const CHEAT_CODES = {
  levelUp: [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ],
  level: ["l", "e", "v", "e", "l"],
  scoreBoost: ["s", "c", "o", "r", "e"],
  clearBoard: ["c", "l", "e", "a", "r"],
  choosePiece: ["p", "i", "e", "c", "e"],
  rainbowMode: ["r", "a", "i", "n", "b", "o", "w"],
  godMode: ["g", "o", "d"],
  speedMode: ["s", "p", "e", "e", "d"],
  bigMode: ["b", "i", "g"],
  customValue: ["c", "u", "s", "t", "o", "m"],
  secretMenu: ["m", "e", "n", "u"],
}

const GRAVITY_LEVELS = [
  0.01667, // Level 0
  0.01667, // Level 1
  0.021017, // Level 2
  0.026977, // Level 3
  0.035256, // Level 4
  0.04693, // Level 5
  0.06361, // Level 6
  0.0879, // Level 7
  0.1236, // Level 8
  0.1775, // Level 9
  0.2598, // Level 10
  0.388, // Level 11
  0.59, // Level 12
  0.92, // Level 13
  1.46, // Level 14
  2.36, // Level 15
  2.36, // Level 16+
]

export function useGameLogic(gameStarted: boolean) {
  // Game state
  const [board, setBoard] = useState(() => createEmptyBoard())
  const [activePiece, setActivePiece] = useState({
    position: { x: 0, y: 0 },
    tetromino: [[0]],
    collided: false,
  })
  const [nextPiece, setNextPiece] = useState<TETROMINO_TYPES>("I")
  const [heldPiece, setHeldPiece] = useState<TETROMINO_TYPES | null>(null)
  const [canHold, setCanHold] = useState(true)
  const [dropTime, setDropTime] = useState<number | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [shadowPosition, setShadowPosition] = useState({ x: 0, y: 0 })
  const [isPaused, setIsPaused] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [baseDropTime, setBaseDropTime] = useState(INITIAL_DROP_TIME)
  const [keySequence, setKeySequence] = useState<string[]>([])
  const [activeCheat, setActiveCheat] = useState<string | null>(null)
  const [rainbowMode, setRainbowMode] = useState(false)
  const [godMode, setGodMode] = useState(false)
  const [speedMode, setSpeedMode] = useState(false)
  const [bigMode, setBigMode] = useState(false)
  const [showSecretMenu, setShowSecretMenu] = useState(false)
  const [customValueType, setCustomValueType] = useState<string | null>(null)

  // Use refs for values that don't need to trigger re-renders
  const visualPositionRef = useRef({ x: 0, y: 0 })
  const moveLeftRef = useRef(false)
  const moveRightRef = useRef(false)
  const softDropRef = useRef(false)
  const lastFrameTimeRef = useRef(0)
  const gravityAccumulatorRef = useRef(0)
  const gameStartTimeRef = useRef<number | null>(null)
  const animationFrameIdRef = useRef<number | null>(null)
  const levelRef = useRef(1)
  const speedModeRef = useRef(false)
  const godModeRef = useRef(false)
  const activePieceRef = useRef({
    position: { x: 0, y: 0 },
    tetromino: [[0]],
    collided: false,
  })

  // Refs to prevent stale closures and track state between renders
  const gameStateRef = useRef({
    isProcessingDrop: false,
    isGeneratingPiece: false,
    lastDropTime: 0,
    isHardDropping: false,
    lastMoveTime: 0,
    isHoldingPiece: false,
    isLineClearing: false,
    gameHasStarted: false,
    choosingPiece: false,
    customValueActive: false,
    isPaused: false,
    gameOver: false,
    gameStarted: false,
    isUpdatingBoard: false,
  })

  // Keep refs in sync with state
  useEffect(() => {
    levelRef.current = level
    speedModeRef.current = speedMode
    godModeRef.current = godMode
    activePieceRef.current = activePiece
    gameStateRef.current.isPaused = isPaused
    gameStateRef.current.gameOver = gameOver
    gameStateRef.current.gameStarted = gameStarted
  }, [level, speedMode, godMode, activePiece, isPaused, gameOver, gameStarted])

  // Load high score from localStorage on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem("tetrisHighScore")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore, 10))
    }
  }, [])

  // Update high score when game ends
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score)
      localStorage.setItem("tetrisHighScore", score.toString())
    }
  }, [gameOver, score, highScore])

  // Increase game speed over time
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return

    // Set the game start time when the game begins
    if (gameStartTimeRef.current === null) {
      gameStartTimeRef.current = Date.now()
    }

    const speedIncreaseTimer = setInterval(() => {
      if (!isPaused && !gameOver) {
        setBaseDropTime((prevTime) => Math.max(100, prevTime * SPEED_INCREASE_FACTOR))
      }
    }, SPEED_INCREASE_INTERVAL)

    return () => {
      clearInterval(speedIncreaseTimer)
    }
  }, [gameStarted, gameOver, isPaused])

  // Update drop time when base drop time changes
  useEffect(() => {
    if (dropTime !== null) {
      setDropTime(baseDropTime / (level + 1) + 200)
    }
  }, [baseDropTime, level])

  // Check if rows are completed and clear them
  const sweepRows = useCallback((newBoard: number[][]) => {
    if (gameStateRef.current.isLineClearing) return newBoard

    gameStateRef.current.isLineClearing = true

    let rowsCleared = 0
    let linesCleared = 0

    // Find rows to clear
    const rowsToClear: number[] = []
    newBoard.forEach((row, index) => {
      if (row.every((cell) => cell > 0)) {
        rowsToClear.push(index)
        rowsCleared += 1
        linesCleared += 1
      }
    })

    // If no rows to clear, return the board as is
    if (rowsToClear.length === 0) {
      gameStateRef.current.isLineClearing = false
      return newBoard
    }

    // Create a new board without the cleared rows
    const sweepedBoard = [...newBoard]

    // Clear the rows with a slight delay to allow for animation
    setTimeout(() => {
      const updatedBoard = sweepedBoard.filter((_, index) => !rowsToClear.includes(index))

      // Add new empty rows at the top
      while (updatedBoard.length < BOARD_HEIGHT) {
        updatedBoard.unshift(new Array(BOARD_WIDTH).fill(0))
      }

      setBoard(updatedBoard)

      // Calculate score based on NES Tetris scoring system
      let points = 0
      switch (rowsCleared) {
        case 1: // Single
          points = 40 * (levelRef.current + 1)
          break
        case 2: // Double
          points = 100 * (levelRef.current + 1)
          break
        case 3: // Triple
          points = 300 * (levelRef.current + 1)
          break
        case 4: // Tetris
          points = 1200 * (levelRef.current + 1)
          break
      }

      setScore((prev) => prev + points)
      setLines((prev) => {
        const newLines = prev + linesCleared
        // Check for level up
        if (newLines > levelRef.current * 10) {
          setLevel((prevLevel) => prevLevel + 1)
        }
        return newLines
      })

      // Release the line clearing lock
      gameStateRef.current.isLineClearing = false
    }, 100)

    return sweepedBoard
  }, [])

  // Generate a new piece
  const generateNewPiece = useCallback(() => {
    // Prevent multiple piece generations
    if (gameStateRef.current.isGeneratingPiece || gameStateRef.current.isHardDropping) return
    gameStateRef.current.isGeneratingPiece = true

    const randomTetromino = nextPiece
    let nextRandomTetromino: TETROMINO_TYPES

    // Ensure we get a different random tetromino for the next piece
    do {
      nextRandomTetromino = Object.keys(TETROMINOS)[
        Math.floor(Math.random() * Object.keys(TETROMINOS).length)
      ] as TETROMINO_TYPES
    } while (nextRandomTetromino === randomTetromino)

    // Calculate the center position for the piece
    const centerX = Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOS[randomTetromino].shape[0].length / 2)

    // Set the active piece
    const newPosition = { x: centerX, y: 0 }

    // Check if the new piece would immediately collide
    if (checkCollision(TETROMINOS[randomTetromino].shape, newPosition, board) && !godModeRef.current) {
      // Game over if the piece would immediately collide
      setGameOver(true)
      setDropTime(null)
      gameStateRef.current.isGeneratingPiece = false
      gameStateRef.current.isHardDropping = false
      return
    }

    const newPiece = {
      position: newPosition,
      tetromino: TETROMINOS[randomTetromino].shape,
      collided: false,
    }

    setActivePiece(newPiece)
    activePieceRef.current = newPiece
    visualPositionRef.current = newPosition

    // Set the next piece
    setNextPiece(nextRandomTetromino)

    // Reset hold ability
    setCanHold(true)

    // Reset drop time to normal
    setDropTime(baseDropTime / (levelRef.current + 1) + 200)

    // Allow piece generation again after a delay
    setTimeout(() => {
      gameStateRef.current.isGeneratingPiece = false
    }, 250) // Longer delay to prevent rapid piece generation
  }, [nextPiece, baseDropTime, board])

  // Hold the current piece
  const holdPiece = useCallback(() => {
    if (!canHold || isPaused || gameOver || !gameStarted || gameStateRef.current.isHoldingPiece) return

    gameStateRef.current.isHoldingPiece = true

    // Get the current piece type
    const currentType = Object.keys(TETROMINOS).find((key) => {
      const shape = TETROMINOS[key as TETROMINO_TYPES].shape
      return JSON.stringify(shape) === JSON.stringify(activePieceRef.current.tetromino)
    }) as TETROMINO_TYPES | undefined

    if (!currentType) {
      gameStateRef.current.isHoldingPiece = false
      return // Safety check
    }

    // If there's no held piece, store the current piece and get the next piece
    if (heldPiece === null) {
      // Store the current piece
      setHeldPiece(currentType)

      // Calculate the center position for the next piece
      const centerX = Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOS[nextPiece].shape[0].length / 2)
      const newPosition = { x: centerX, y: 0 }

      // Get the next piece
      const newPiece = {
        position: newPosition,
        tetromino: TETROMINOS[nextPiece].shape,
        collided: false,
      }
      setActivePiece(newPiece)
      activePieceRef.current = newPiece
      visualPositionRef.current = newPosition

      // Generate a new next piece
      const tetrominoTypes = Object.keys(TETROMINOS) as TETROMINO_TYPES[]
      const nextRandomTetromino = tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)]
      setNextPiece(nextRandomTetromino)
    } else {
      // Calculate the center position for the held piece
      const centerX = Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOS[heldPiece].shape[0].length / 2)
      const newPosition = { x: centerX, y: 0 }

      // Swap the current piece with the held piece
      const newPiece = {
        position: newPosition,
        tetromino: TETROMINOS[heldPiece].shape,
        collided: false,
      }
      setActivePiece(newPiece)
      activePieceRef.current = newPiece
      visualPositionRef.current = newPosition

      // Update the held piece
      setHeldPiece(currentType)
    }

    // Disable hold until the next piece is placed
    setCanHold(false)

    // Release the hold lock after a delay
    setTimeout(() => {
      gameStateRef.current.isHoldingPiece = false
    }, 150)
  }, [canHold, heldPiece, nextPiece, isPaused, gameOver, gameStarted])

  // Update board with active piece
  const updateBoard = useCallback(() => {
    if (activePieceRef.current.tetromino.length <= 1) return // Skip if no active piece

    // Use a ref to track if we're currently updating the board to prevent nested updates
    if (gameStateRef.current.isUpdatingBoard) return
    gameStateRef.current.isUpdatingBoard = true

    setBoard((prevBoard) => {
      // First, create a new board without the active piece
      const newBoard = prevBoard.map((row) => row.map((cell) => (cell < 0 ? 0 : cell)))

      // Then, add the active piece to the board
      activePieceRef.current.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const boardY = Math.floor(activePieceRef.current.position.y) + y
            const boardX = Math.floor(activePieceRef.current.position.x) + x

            // Make sure we're within board boundaries
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              newBoard[boardY][boardX] = activePieceRef.current.collided ? value : -value
            }
          }
        })
      })

      // If the piece has collided, sweep rows and get a new piece
      if (activePieceRef.current.collided) {
        const sweptBoard = sweepRows(newBoard);

        // Delay the new piece generation slightly to allow sweep animation
       setTimeout(() => {
        // Generate a new piece
       generateNewPiece();
    
        // Reset update lock
        gameStateRef.current.isUpdatingBoard = false;
         }, 250); // Slightly more time to allow visual clearing

        // Don't reset the active piece here.
        // Just let it be replaced by generateNewPiece()

        return sweptBoard;
}


      // Release the lock after a short delay
      setTimeout(() => {
        gameStateRef.current.isUpdatingBoard = false
      }, 50)

      return newBoard
    })
  }, [sweepRows, generateNewPiece])

  // Update shadow position
  const updateShadowPosition = useCallback(() => {
    if (!activePieceRef.current || activePieceRef.current.tetromino.length <= 1) return

    let shadowY = activePieceRef.current.position.y

    while (
      !checkCollision(activePieceRef.current.tetromino, { x: activePieceRef.current.position.x, y: shadowY + 1 }, board)
    ) {
      shadowY += 1
    }

    setShadowPosition({ x: activePieceRef.current.position.x, y: shadowY })
  }, [board])

  // Drop piece one row
  const drop = useCallback(() => {
    // Prevent multiple drops from processing at the same time
    if (gameStateRef.current.isPaused || gameStateRef.current.gameOver || gameStateRef.current.isProcessingDrop) return

    // Throttle drops to prevent lag
    const now = Date.now()
    if (now - gameStateRef.current.lastDropTime < 50) return
    gameStateRef.current.lastDropTime = now

    gameStateRef.current.isProcessingDrop = true

    // Check if the piece would go below the boundary
    const wouldHitBottom = activePieceRef.current.tetromino.some((row, y) => {
      return row.some((cell, x) => {
        if (cell !== 0) {
          const boardY = y + activePieceRef.current.position.y + 1
          return boardY >= BOARD_HEIGHT
        }
        return false
      })
    })

    // Check if collision would occur after dropping
    if (
      !wouldHitBottom &&
      (!checkCollision(
        activePieceRef.current.tetromino,
        { x: activePieceRef.current.position.x, y: activePieceRef.current.position.y + 1 },
        board,
      ) ||
        godModeRef.current)
    ) {
      const newPosition = {
        ...activePieceRef.current.position,
        y: activePieceRef.current.position.y + 1,
      }

      const newPiece = {
        ...activePieceRef.current,
        position: newPosition,
      }

      setActivePiece(newPiece)
      activePieceRef.current = newPiece
    } else {
      // If piece has reached the top, game over
      if (activePieceRef.current.position.y < 1 && !godModeRef.current) {
        setGameOver(true)
        setDropTime(null)
        gameStateRef.current.isProcessingDrop = false
        return
      }

      // Set piece as collided
      const newPiece = {
        ...activePieceRef.current,
        collided: true,
      }

      setActivePiece(newPiece)
      activePieceRef.current = newPiece
    }

    // Allow drops again
    setTimeout(() => {
      gameStateRef.current.isProcessingDrop = false
    }, 50)
  }, [board])

  // Toggle pause
  const togglePause = useCallback(() => {
    if (!gameStateRef.current.gameOver && gameStateRef.current.gameStarted) {
      setIsPaused((prev) => !prev)
    }
  }, [])

  // Reset game
  const resetGame = useCallback(() => {
    // Cancel any existing animation frame
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
    }

    // Reset the board
    setBoard(createEmptyBoard())

    // Reset game state ref
    gameStateRef.current = {
      isProcessingDrop: false,
      isGeneratingPiece: false,
      lastDropTime: 0,
      isHardDropping: false,
      lastMoveTime: 0,
      isHoldingPiece: false,
      isLineClearing: false,
      gameHasStarted: true,
      choosingPiece: false,
      customValueActive: false,
      isPaused: false,
      gameOver: false,
      gameStarted: true,
      isUpdatingBoard: false,
    }

    // Initialize with empty tetromino
    const initialPiece = {
      position: { x: 0, y: 0 },
      tetromino: [[0]],
      collided: false,
    }
    setActivePiece(initialPiece)
    activePieceRef.current = initialPiece
    visualPositionRef.current = { x: 0, y: 0 }

    // Ensure we get a random tetromino for the next piece
    const randomTetromino = Object.keys(TETROMINOS)[
      Math.floor(Math.random() * Object.keys(TETROMINOS).length)
    ] as TETROMINO_TYPES

    // Set the next piece
    setNextPiece(randomTetromino)

    // Reset held piece
    setHeldPiece(null)
    setCanHold(true)

    // Reset game state
    setBaseDropTime(INITIAL_DROP_TIME)
    setDropTime(INITIAL_DROP_TIME)
    setGameOver(false)
    setScore(0)
    setLines(0)
    setLevel(1)
    levelRef.current = 1
    setIsPaused(false)
    gameStartTimeRef.current = Date.now()
    gravityAccumulatorRef.current = 0
    setRainbowMode(false)
    setGodMode(false)
    godModeRef.current = false
    setSpeedMode(false)
    speedModeRef.current = false
    setBigMode(false)
    setKeySequence([])
    setActiveCheat(null)
    setShowSecretMenu(false)
    setCustomValueType(null)

    // Reset movement refs
    moveLeftRef.current = false
    moveRightRef.current = false
    softDropRef.current = false
    lastFrameTimeRef.current = 0

    // Start the game loop
    startGameLoop()

    // Generate the first piece after a short delay
    setTimeout(() => {
      generateNewPiece()
    }, 100)
  }, [generateNewPiece])

  // Handle cheat codes
  useEffect(() => {
    // Check if the current key sequence matches any cheat code
    for (const [cheatName, sequence] of Object.entries(CHEAT_CODES)) {
      if (
        keySequence.length >= sequence.length &&
        keySequence.slice(-sequence.length).every((key, i) => key === sequence[i])
      ) {
        // Activate the cheat
        setActiveCheat(cheatName)

        // Apply cheat effect
        switch (cheatName) {
          case "levelUp":
          case "level": // Handle both level codes the same way
            setLevel((prev) => {
              const newLevel = Math.min(prev + 1, 15)
              levelRef.current = newLevel
              return newLevel
            })
            break
          case "scoreBoost":
            setScore((prev) => prev + 10000)
            break
          case "clearBoard":
            setBoard(createEmptyBoard())
            break
          case "choosePiece":
            gameStateRef.current.choosingPiece = true
            setIsPaused(true)
            break
          case "rainbowMode":
            setRainbowMode((prev) => !prev)
            break
          case "godMode":
            setGodMode((prev) => {
              const newValue = !prev
              godModeRef.current = newValue
              return newValue
            })
            break
          case "speedMode":
            setSpeedMode((prev) => {
              const newValue = !prev
              speedModeRef.current = newValue
              return newValue
            })
            break
          case "bigMode":
            setBigMode((prev) => !prev)
            break
          case "customValue":
            gameStateRef.current.customValueActive = true
            setCustomValueType("score")
            setIsPaused(true)
            break
          case "secretMenu":
            setShowSecretMenu((prev) => !prev)
            break
        }

        // Clear the key sequence
        setKeySequence([])

        // Clear the active cheat after a delay
        setTimeout(() => {
          setActiveCheat(null)
          if (cheatName === "choosePiece") {
            gameStateRef.current.choosingPiece = false
            if (!gameStateRef.current.customValueActive) {
              setIsPaused(false)
            }
          }
        }, 2000)

        break
      }
    }
  }, [keySequence])

  // Choose a specific piece (for cheat)
  const choosePiece = useCallback((pieceType: TETROMINO_TYPES) => {
    if (!gameStateRef.current.choosingPiece) return

    // Calculate the center position for the piece
    const centerX = Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOS[pieceType].shape[0].length / 2)

    // Set the active piece
    const newPiece = {
      position: { x: centerX, y: 0 },
      tetromino: TETROMINOS[pieceType].shape,
      collided: false,
    }

    setActivePiece(newPiece)
    activePieceRef.current = newPiece
    visualPositionRef.current = { x: centerX, y: 0 }

    // End choosing mode
    gameStateRef.current.choosingPiece = false
    if (!gameStateRef.current.customValueActive) {
      setIsPaused(false)
    }
  }, [])

  // Set custom value (for cheat)
  const setCustomValue = useCallback((type: string, value: number) => {
    if (!gameStateRef.current.customValueActive) return

    switch (type) {
      case "score":
        setScore(value)
        break
      case "level":
        setLevel(Math.min(Math.max(1, value), 15))
        levelRef.current = Math.min(Math.max(1, value), 15)
        break
      case "lines":
        setLines(value)
        break
    }

    // Move to next value type or end
    if (type === "score") {
      setCustomValueType("level")
    } else if (type === "level") {
      setCustomValueType("lines")
    } else {
      setCustomValueType(null)
      gameStateRef.current.customValueActive = false
      setIsPaused(false)
    }
  }, [])

  // Game loop for smooth movement - using requestAnimationFrame
  const gameLoop = useCallback(
    (timestamp: number) => {
      // Skip if game is not active
      if (gameStateRef.current.gameOver || gameStateRef.current.isPaused) {
        animationFrameIdRef.current = requestAnimationFrame(gameLoop)
        return
      }

      // Calculate delta time
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp
      }
      const deltaTime = timestamp - lastFrameTimeRef.current
      lastFrameTimeRef.current = timestamp

      // Calculate movement speed based on speedMode
      const currentMoveSpeed = speedModeRef.current ? MOVE_SPEED * 2 : MOVE_SPEED
      const currentSoftDropSpeed = speedModeRef.current ? SOFT_DROP_SPEED * 2 : SOFT_DROP_SPEED

      // Create a local copy of the visual position to work with
      const newVisualPosition = { ...visualPositionRef.current }
      let updated = false

      // Horizontal movement
      if (moveLeftRef.current && !moveRightRef.current) {
        // Move towards target position (activePiece.position.x)
        const targetX = activePieceRef.current.position.x
        if (newVisualPosition.x > targetX) {
          newVisualPosition.x = Math.max(newVisualPosition.x - currentMoveSpeed, targetX)
          updated = true
        }
      } else if (moveRightRef.current && !moveLeftRef.current) {
        // Move towards target position (activePiece.position.x)
        const targetX = activePieceRef.current.position.x
        if (newVisualPosition.x < targetX) {
          newVisualPosition.x = Math.min(newVisualPosition.x + currentMoveSpeed, targetX)
          updated = true
        }
      } else {
        // No horizontal movement, snap to grid
        const targetX = Math.round(newVisualPosition.x)
        if (Math.abs(newVisualPosition.x - targetX) > 0.01) {
          newVisualPosition.x = targetX
          updated = true
        }
      }

      // Vertical movement (soft drop)
      if (softDropRef.current) {
        // Move towards target position (activePiece.position.y)
        const targetY = activePieceRef.current.position.y
        if (newVisualPosition.y < targetY) {
          newVisualPosition.y = Math.min(newVisualPosition.y + currentSoftDropSpeed, targetY)
          updated = true
        }
      } else {
        // Normal gravity
        const gravityIndex = Math.min(levelRef.current, GRAVITY_LEVELS.length - 1)
        const gravity = GRAVITY_LEVELS[gravityIndex] * (speedModeRef.current ? 2 : 1)

        gravityAccumulatorRef.current += gravity

        // If we've accumulated enough to drop a cell
        if (gravityAccumulatorRef.current >= 1) {
          // Drop the piece
          drop()
          // Reset the accumulator
          gravityAccumulatorRef.current = 0
        }

        // Smooth visual movement for gravity
        const targetY = activePieceRef.current.position.y
        if (newVisualPosition.y < targetY) {
          newVisualPosition.y = Math.min(newVisualPosition.y + 0.05, targetY)
          updated = true
        }
      }

      // Update visual position ref
      if (updated) {
        visualPositionRef.current = newVisualPosition
      }

      animationFrameIdRef.current = requestAnimationFrame(gameLoop)
    },
    [drop],
  )

  // Start the game loop
  const startGameLoop = useCallback(() => {
    // Cancel any existing animation frame
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current)
    }

    // Start a new animation frame loop
    animationFrameIdRef.current = requestAnimationFrame(gameLoop)
  }, [gameLoop])

  // Stop the game loop
  const stopGameLoop = useCallback(() => {
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
    }
  }, [])

  // Start/stop game loop based on game state
  // Effect for game loop management
  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      startGameLoop()
    } else {
      stopGameLoop()
    }

    return () => {
      stopGameLoop()
    }
  }, [gameStarted, gameOver, isPaused, startGameLoop, stopGameLoop])

  // Separate effect for board updates - only run when needed
  useEffect(() => {
    // This will run once when the component mounts
    const updateBoardOnPieceChange = () => {
      if (activePieceRef.current.tetromino.length > 1) {
        updateBoard()
        updateShadowPosition()
      }
    }

    // Set up a MutationObserver to watch for changes to activePieceRef
    const intervalId = setInterval(updateBoardOnPieceChange, 50)

    return () => {
      clearInterval(intervalId)
    }
  }, [updateBoard, updateShadowPosition])

  // Start game effect
  useEffect(() => {
    if (gameStarted && !gameOver && !gameStateRef.current.gameHasStarted) {
      resetGame()
    } else if (!gameStarted) {
      setDropTime(null)
    }
  }, [gameStarted, gameOver, resetGame])

  // Move piece left
  const moveLeft = useCallback(() => {
    if (gameStateRef.current.isPaused || gameStateRef.current.gameOver || !gameStateRef.current.gameStarted) return

    moveLeftRef.current = true
    moveRightRef.current = false

    // Throttle moves for smoother movement
    const now = Date.now()
    if (now - gameStateRef.current.lastMoveTime < MOVE_REPEAT_DELAY) return
    gameStateRef.current.lastMoveTime = now

    if (
      !checkCollision(
        activePieceRef.current.tetromino,
        { x: activePieceRef.current.position.x - 1, y: activePieceRef.current.position.y },
        board,
      ) ||
      godModeRef.current
    ) {
      const newPosition = {
        ...activePieceRef.current.position,
        x: activePieceRef.current.position.x - 1,
      }

      const newPiece = {
        ...activePieceRef.current,
        position: newPosition,
      }

      setActivePiece(newPiece)
      activePieceRef.current = newPiece
    }
  }, [board])

  // Stop moving left
  const stopMoveLeft = useCallback(() => {
    moveLeftRef.current = false
  }, [])

  // Move piece right
  const moveRight = useCallback(() => {
    if (gameStateRef.current.isPaused || gameStateRef.current.gameOver || !gameStateRef.current.gameStarted) return

    moveRightRef.current = true
    moveLeftRef.current = false

    // Throttle moves for smoother movement
    const now = Date.now()
    if (now - gameStateRef.current.lastMoveTime < MOVE_REPEAT_DELAY) return
    gameStateRef.current.lastMoveTime = now

    if (
      !checkCollision(
        activePieceRef.current.tetromino,
        { x: activePieceRef.current.position.x + 1, y: activePieceRef.current.position.y },
        board,
      ) ||
      godModeRef.current
    ) {
      const newPosition = {
        ...activePieceRef.current.position,
        x: activePieceRef.current.position.x + 1,
      }

      const newPiece = {
        ...activePieceRef.current,
        position: newPosition,
      }

      setActivePiece(newPiece)
      activePieceRef.current = newPiece
    }
  }, [board])

  // Stop moving right
  const stopMoveRight = useCallback(() => {
    moveRightRef.current = false
  }, [])

  // Rotate piece
  const rotate = useCallback(() => {
    if (
      gameStateRef.current.isPaused ||
      gameStateRef.current.gameOver ||
      !gameStateRef.current.gameStarted ||
      activePieceRef.current.tetromino.length <= 1
    )
      return

    const rotatedTetromino = activePieceRef.current.tetromino[0]
      .map((_, index) => activePieceRef.current.tetromino.map((row) => row[index]))
      .reverse()

    // Check if rotation is possible
    if (!checkCollision(rotatedTetromino, activePieceRef.current.position, board) || godModeRef.current) {
      const newPiece = {
        ...activePieceRef.current,
        tetromino: rotatedTetromino,
      }

      setActivePiece(newPiece)
      activePieceRef.current = newPiece
    }
  }, [board])

  // Soft drop - accelerate piece falling
  const softDrop = useCallback(() => {
    if (gameStateRef.current.isPaused || gameStateRef.current.gameOver || !gameStateRef.current.gameStarted) return

    softDropRef.current = true

    // Throttle soft drops for smoother movement
    const now = Date.now()
    if (now - gameStateRef.current.lastDropTime < MOVE_REPEAT_DELAY) return
    gameStateRef.current.lastDropTime = now

    // Add 1 point for each cell soft dropped
    setScore((prev) => prev + 1)

    // Drop the piece
    drop()
  }, [drop])

  // Stop soft drop
  const stopSoftDrop = useCallback(() => {
    softDropRef.current = false
  }, [])

  // Hard drop - instantly place piece at bottom
  const hardDrop = useCallback(() => {
    if (
      gameStateRef.current.isPaused ||
      gameStateRef.current.gameOver ||
      !gameStateRef.current.gameStarted ||
      gameStateRef.current.isHardDropping
    )
      return

    gameStateRef.current.isHardDropping = true

    let newY = activePieceRef.current.position.y

    // Find the lowest valid position
    while (
      !checkCollision(activePieceRef.current.tetromino, { x: activePieceRef.current.position.x, y: newY + 1 }, board) ||
      godModeRef.current
    ) {
      newY += 1
      if (godModeRef.current && newY > BOARD_HEIGHT * 2) break // Prevent infinite loop in god mode
    }

    // Set the piece at the bottom position and mark as collided
    const newPosition = {
      ...activePieceRef.current.position,
      y: newY,
    }

    const newPiece = {
      ...activePieceRef.current,
      position: newPosition,
      collided: true,
    }

    setActivePiece(newPiece)
    activePieceRef.current = newPiece
    visualPositionRef.current = { x: activePieceRef.current.position.x, y: newY }

    // Ensure we don't process another drop until this one is complete
    // This prevents pieces from merging at the top
    setTimeout(() => {
      gameStateRef.current.isHardDropping = false
    }, 300) // Longer cooldown to ensure piece is placed before next piece spawns
  }, [board])

  // Handle key down for cheat codes
  const handleKeyDown = useCallback((key: string) => {
    // Add the key to the sequence
    setKeySequence((prev) => [...prev.slice(-9), key])
  }, [])

  return {
    board,
    score,
    level,
    lines,
    activePiece,
    visualPosition: visualPositionRef.current,
    nextPiece,
    heldPiece,
    canHold,
    gameOver,
    shadowPosition,
    moveLeft,
    stopMoveLeft,
    moveRight,
    stopMoveRight,
    rotate,
    softDrop,
    stopSoftDrop,
    hardDrop,
    holdPiece,
    resetGame,
    isPaused,
    togglePause,
    highScore,
    baseDropTime,
    handleKeyDown,
    activeCheat,
    rainbowMode,
    godMode,
    speedMode,
    bigMode,
    choosePiece,
    gameStateRef,
    showSecretMenu,
    setShowSecretMenu,
    customValueType,
    setCustomValue,
  }
}
