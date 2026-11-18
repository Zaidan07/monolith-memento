import type { Element } from "./trekkers"

export const favoriteResult = {
  kicker: "STELLA SORA PICK",
  title: "Favorite Trekkers by Element",
  subtitle: "Favorite Trekkers by element",
  footer: "My Novaria picks",
}

export const elementSymbols: Record<Element, { path: string; color: string }> = {
  Ignis: { path: "M12 22a7 7 0 0 1-7-7c0-3 2-5 3-6 0 3 2 4 2 4-1-5 2-8 4-11 0 4 5 7 5 13a7 7 0 0 1-7 7Z", color: "#ffaec0" },
  Aqua: { path: "M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13Z", color: "#a0d8ff" },
  Terra: { path: "M2 20 9 6l4 7 3-4 6 11H2ZM7 10l2 2 2-2", color: "#ffdb94" },
  Ventus: { path: "M2 8h13a2.5 2.5 0 1 0-2.5-2.5M2 12h17a2.5 2.5 0 1 1-2.5 2.5M2 16h8a2.5 2.5 0 1 1-2.5 2.5", color: "#94e7cb" },
  Lux: { path: "M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z", color: "#d6c6ff" },
  Umbra: { path: "M20.5 15.8A9 9 0 1 1 8.2 3.5a7.5 7.5 0 0 0 12.3 12.3Z", color: "#f2bcff" },
}
