// The little world: five places along one path. x is % from the left.
export const PLACE_IDS = ["trail", "home", "park", "cafe", "beach"] as const;
export type PlaceId = (typeof PLACE_IDS)[number];

export const PLACES: Record<PlaceId, { name: string; x: number }> = {
  trail: { name: "Trail", x: 10 },
  home: { name: "Home", x: 31 },
  park: { name: "Dog Park", x: 52 },
  cafe: { name: "Café", x: 72 },
  beach: { name: "Beach", x: 90 },
};

export type Weather = "sun" | "rain" | "heat";

// One random opening event per run. Each also changes the world's look.
export interface Twist {
  text: string;
  weather: Weather;
  closed?: PlaceId;
}

export const TWISTS: Twist[] = [
  { text: "Perfect weather: 68°F and sunny all day.", weather: "sun" },
  { text: "It is drizzling all morning and clears up around 3pm.", weather: "rain" },
  { text: "Heat advisory: 92°F by noon, cooling off after 6pm.", weather: "heat" },
  { text: "Rob's deadline just moved UP to 2pm.", weather: "sun" },
  { text: "Rob's deadline just got pushed to tomorrow.", weather: "sun" },
  { text: "Ziggy's front paw is a little sore from yesterday's hike.", weather: "sun" },
  { text: "A friend invited everyone to a dog-friendly brunch at the Café at 11am.", weather: "sun" },
  { text: "The Beach is closed today for a festival; everything else is open.", weather: "sun", closed: "beach" },
];

export function asPlace(p: unknown, fallback: PlaceId = "home"): PlaceId {
  return (PLACE_IDS as readonly string[]).includes(p as string) ? (p as PlaceId) : fallback;
}

// "5:45 PM", "17:30", "5:45" -> is it evening? Used to turn the sky to sunset.
export function isEvening(time: string): boolean {
  const m = time.match(/(\d{1,2})(?::\d{2})?\s*(am|pm)?/i);
  if (!m) return false;
  let h = Number(m[1]);
  const ap = m[2]?.toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (!ap && h >= 1 && h <= 9) h += 12; // "5:45" in a day plan means afternoon
  return h >= 17;
}
