const SYNODIC_MONTH = 29.53058867;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

/** Fraction of the synodic month elapsed (0 = new moon, 0.5 = full moon) */
function getMoonPhaseFraction(date: Date): number {
  const diffDays = (date.getTime() - KNOWN_NEW_MOON) / 86400000;
  return (((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH) / SYNODIC_MONTH;
}

export function isFullMoon(date: Date): boolean {
  return Math.abs(getMoonPhaseFraction(date) - 0.5) < 0.06;
}
