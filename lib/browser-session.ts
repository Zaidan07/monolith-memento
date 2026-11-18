import { uuidPattern } from "./trekkers"

const sessionKey = "stella-sora-pick:session-id"

export function getSessionId(key = sessionKey) {
  const stored = localStorage.getItem(key)
  if (stored && uuidPattern.test(stored)) return stored
  const id = crypto.randomUUID()
  localStorage.setItem(key, id)
  return id
}

