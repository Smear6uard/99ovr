/** Single source of truth for display tier thresholds and colors. */
export const RATING_TIERS = [
  { id: "bench", name: "Bench Warmer", min: 0, max: 54, color: "#B0793F" },
  { id: "role", name: "Role Player", min: 55, max: 64, color: "#A8B0BF" },
  { id: "starter", name: "Starter", min: 65, max: 74, color: "#C7CDD6" },
  { id: "allstar", name: "All-Star", min: 75, max: 82, color: "#55B8C9" },
  { id: "superstar", name: "Superstar", min: 83, max: 89, color: "#F2B94B" },
  { id: "hof", name: "HOF", min: 90, max: 95, color: "#8B5CF6" },
  { id: "goat", name: "GOAT", min: 96, max: 99, color: "#E5484D" },
] as const;
