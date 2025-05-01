interface CheatNotificationProps {
  cheatName: string
}

export function CheatNotification({ cheatName }: CheatNotificationProps) {
  let message = ""
  let color = ""

  switch (cheatName) {
    case "levelUp":
    case "level":
      message = "Level Up! +1 Level"
      color = "bg-purple-600"
      break
    case "scoreBoost":
      message = "Score Boost! +10,000 Points"
      color = "bg-yellow-600"
      break
    case "clearBoard":
      message = "Board Cleared!"
      color = "bg-blue-600"
      break
    case "choosePiece":
      message = "Choose Your Next Piece"
      color = "bg-green-600"
      break
    case "rainbowMode":
      message = "Rainbow Mode Toggled!"
      color = "bg-pink-600"
      break
    case "godMode":
      message = "God Mode Toggled!"
      color = "bg-red-600"
      break
    case "speedMode":
      message = "Speed Mode Toggled!"
      color = "bg-blue-600"
      break
    case "bigMode":
      message = "Big Mode Toggled!"
      color = "bg-green-600"
      break
    case "customValue":
      message = "Custom Value Mode"
      color = "bg-orange-600"
      break
    case "secretMenu":
      message = "Secret Menu Opened"
      color = "bg-purple-600"
      break
    default:
      message = "Cheat Activated!"
      color = "bg-red-600"
  }

  return (
    <div className="absolute top-4 left-0 right-0 mx-auto w-max z-50 animate-bounce">
      <div className={`${color} text-white px-4 py-2 rounded-md shadow-lg font-bold nes-text`}>{message}</div>
    </div>
  )
}
