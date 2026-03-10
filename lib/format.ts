export function toET(utcDate: string): string {
  return new Date(utcDate).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function toETFull(utcDate: string): string {
  return new Date(utcDate).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function americanToDecimal(american: number): number {
  if (american > 0) return +(american / 100 + 1).toFixed(2);
  return +(100 / Math.abs(american) + 1).toFixed(2);
}

export function impliedProbability(american: number): number {
  if (american > 0) return +(100 / (american + 100) * 100).toFixed(1);
  return +(Math.abs(american) / (Math.abs(american) + 100) * 100).toFixed(1);
}

export function formatOdds(american: number): string {
  return american > 0 ? `+${american}` : `${american}`;
}

export function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
