export function formatET(utcIso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(utcIso));
}

export function toAmericanOdds(price: number): string {
  return price > 0 ? `+${price}` : `${price}`;
}

export function toDecimalOdds(price: number): string {
  if (price > 0) return (1 + price / 100).toFixed(2);
  return (1 + 100 / Math.abs(price)).toFixed(2);
}
