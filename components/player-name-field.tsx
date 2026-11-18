"use client"

import { useEffect, useState } from "react"
import { playerNameLimit, readPlayerName, storePlayerName } from "../lib/player-name"

export function PlayerNameField({ disabled, onEdit }: { disabled?: boolean; onEdit?: () => void }) {
  const [name, setName] = useState("")
  useEffect(() => { setName(readPlayerName()) }, [])
  return (
    <label className="favorite-player-name">
      Your name
      <input value={name} disabled={disabled} maxLength={playerNameLimit} placeholder="Tulis namamu"
        onChange={(event) => {
          setName(event.target.value)
          storePlayerName(event.target.value)
          onEdit?.()
        }} />
    </label>
  )
}
