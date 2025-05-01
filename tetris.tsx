"use client"

import { useEffect, useState, useCallback } from "react"
import { useGameLogic } from "./hooks/use-game-logic"
import { GameBoard } from "./components/game-board"
import { GameStats } from "./components/game-stats"
import { GameControls } from "./components/game-controls"
import { NextPieceDisplay } from "./components/next-piece-display"
import { HeldPieceDisplay } from "./components/held-piece-display"
import { GameOverModal } from "./components/game-over-modal"
import { PauseModal } from "./components/pause-modal"
import { TETROMINOS } from "./lib/tetrominos"
import { CheatNotification } from "./components/cheat-notification"
import { PieceSelector } from "./components/piece-selector"
import { CustomValueInput } from "./components/custom-value-input"
import { SecretMenu } from "./components/secret-menu"

export default function Tetris() {
  const [gameStarted, setGameStarted] = useState(false)
  const [showSecretHelp, setShowSecretHelp] = useState(false)
  const {
    board,
    score,
    level,
    lines,
    activePiece,
    visualPosition,
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
  } = useGameLogic(gameStarted)

  const handleKeyboardDown = useCallback(
    (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return

      // Record key for cheat codes
      handleKeyDown(e.key)

      switch (e.key) {
        case "ArrowLeft":
          moveLeft()
          break
        case "ArrowRight":
          moveRight()
          break
        case "ArrowUp":
          rotate()
          break
        case "ArrowDown":
          softDrop()
          break
        case " ":
          e.preventDefault() // Prevent page scrolling
          hardDrop()
          break
        case "p":
        case "P":
          togglePause()
          break
        case "c":
        case "C":
          holdPiece()
          break
        default:
          break
      }
    },
    [gameStarted, gameOver, moveLeft, moveRight, rotate, softDrop, hardDrop, togglePause, holdPiece, handleKeyDown],
  )

  const handleKeyboardUp = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          stopMoveLeft()
          break
        case "ArrowRight":
          stopMoveRight()
          break
        case "ArrowDown":
          stopSoftDrop()
          break
        default:
          break
      }
    },
    [stopMoveLeft, stopMoveRight, stopSoftDrop],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardDown)
    window.addEventListener("keyup", handleKeyboardUp)
    return () => {
      window.removeEventListener("keydown", handleKeyboardDown)
      window.removeEventListener("keyup", handleKeyboardUp)
    }
  }, [handleKeyboardDown, handleKeyboardUp])

  const startGame = () => {
    resetGame()
    setGameStarted(true)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <h1 className="text-4xl font-bold text-white mb-6 tracking-wider nes-title">
        <span className={`text-cyan-400 ${rainbowMode ? "animate-pulse" : ""}`}>T</span>
        <span className={`text-purple-400 ${rainbowMode ? "animate-pulse" : ""}`}>E</span>
        <span className={`text-green-400 ${rainbowMode ? "animate-pulse" : ""}`}>T</span>
        <span className={`text-yellow-400 ${rainbowMode ? "animate-pulse" : ""}`}>R</span>
        <span className={`text-red-400 ${rainbowMode ? "animate-pulse" : ""}`}>I</span>
        <span className={`text-blue-400 ${rainbowMode ? "animate-pulse" : ""}`}>S</span>
      </h1>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex flex-col gap-6">
          <HeldPieceDisplay piece={heldPiece ? TETROMINOS[heldPiece] : null} canHold={canHold} />
          <div className="text-center text-xs text-gray-400">
            Press <span className="font-bold text-white">C</span> to hold
          </div>
        </div>

        <div className="relative">
          <GameBoard
            board={board}
            activePiece={activePiece}
            visualPosition={visualPosition}
            shadowPosition={shadowPosition}
            rainbowMode={rainbowMode}
            bigMode={bigMode}
            key={`board-${activePiece.position.x}-${activePiece.position.y}`}
          />
          {gameOver && <GameOverModal score={score} highScore={highScore} onRestart={startGame} />}
          {isPaused && !gameOver && !gameStateRef.current.choosingPiece && !customValueType && !showSecretMenu && (
            <PauseModal onResume={togglePause} />
          )}
          {gameStateRef.current.choosingPiece && <PieceSelector onSelect={choosePiece} />}
          {customValueType && (
            <CustomValueInput
              type={customValueType}
              onSubmit={setCustomValue}
              currentValue={customValueType === "score" ? score : customValueType === "level" ? level : lines}
            />
          )}
          {showSecretMenu && <SecretMenu onClose={() => setShowSecretMenu(false)} />}
          {activeCheat && <CheatNotification cheatName={activeCheat} />}
        </div>

        <div className="flex flex-col gap-6">
          <NextPieceDisplay piece={TETROMINOS[nextPiece]} />
          <GameStats
            score={score}
            level={level}
            lines={lines}
            highScore={highScore}
            godMode={godMode}
            speedMode={speedMode}
            bigMode={bigMode}
          />
          <GameControls
            onStart={startGame}
            onLeft={moveLeft}
            onStopLeft={stopMoveLeft}
            onRight={moveRight}
            onStopRight={stopMoveRight}
            onRotate={rotate}
            onSoftDrop={softDrop}
            onStopSoftDrop={stopSoftDrop}
            onHardDrop={hardDrop}
            onPause={togglePause}
            onHold={holdPiece}
            gameStarted={gameStarted}
            gameOver={gameOver}
            isPaused={isPaused}
            canHold={canHold}
          />
        </div>
      </div>

      {/* Hidden button for secret help */}
      <div className="mt-6 relative">
        <button
          className="absolute top-0 left-0 w-2 h-2 opacity-0 hover:opacity-100 focus:opacity-100"
          onClick={() => setShowSecretHelp(!showSecretHelp)}
          aria-label="Secret help"
        />
        {showSecretHelp && (
          <div className="text-gray-500 text-xs mt-2 p-2 bg-gray-800 rounded-md">
            <p>Secret codes: "score", "level", "clear", "piece", "rainbow", "god", "speed", "big", "custom", "menu"</p>
            <p>Or the classic: ↑↑↓↓←→←→ba</p>
          </div>
        )}
      </div>
    </div>
  )
}
