// Returns true if current Houston time is between 12:00 PM and 9:30 PM
export function isRestaurantOpen() {
  const now = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })
  const houston = new Date(now)
  const hours = houston.getHours()
  const minutes = houston.getMinutes()
  const totalMinutes = hours * 60 + minutes
  // Open: 12:00 PM (720) to 9:30 PM (1290, last order cutoff)
  return totalMinutes >= 720 && totalMinutes < 1290
}