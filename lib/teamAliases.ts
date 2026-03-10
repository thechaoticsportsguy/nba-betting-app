export const TEAM_ALIASES: Record<string, string[]> = {
  ATL: ['atlanta hawks', 'hawks', 'atl'],
  BOS: ['boston celtics', 'celtics', 'bos'],
  BKN: ['brooklyn nets', 'nets', 'bkn'],
  CHA: ['charlotte hornets', 'hornets', 'cha'],
  CHI: ['chicago bulls', 'bulls', 'chi'],
  CLE: ['cleveland cavaliers', 'cavaliers', 'cavs', 'cle'],
  DAL: ['dallas mavericks', 'mavericks', 'mavs', 'dal'],
  DEN: ['denver nuggets', 'nuggets', 'den'],
  DET: ['detroit pistons', 'pistons', 'det'],
  GSW: ['golden state warriors', 'warriors', 'gsw', 'gs'],
  HOU: ['houston rockets', 'rockets', 'hou'],
  IND: ['indiana pacers', 'pacers', 'ind'],
  LAC: ['la clippers', 'los angeles clippers', 'clippers', 'lac'],
  LAL: ['la lakers', 'los angeles lakers', 'lakers', 'lal'],
  MEM: ['memphis grizzlies', 'grizzlies', 'mem'],
  MIA: ['miami heat', 'heat', 'mia'],
  MIL: ['milwaukee bucks', 'bucks', 'mil'],
  MIN: ['minnesota timberwolves', 'timberwolves', 'wolves', 'min'],
  NOP: ['new orleans pelicans', 'pelicans', 'nop', 'no'],
  NYK: ['new york knicks', 'knicks', 'nyk', 'ny'],
  OKC: ['oklahoma city thunder', 'thunder', 'okc'],
  ORL: ['orlando magic', 'magic', 'orl'],
  PHI: ['philadelphia 76ers', '76ers', 'sixers', 'phi'],
  PHX: ['phoenix suns', 'suns', 'phx'],
  POR: ['portland trail blazers', 'trail blazers', 'blazers', 'por'],
  SAC: ['sacramento kings', 'kings', 'sac'],
  SAS: ['san antonio spurs', 'spurs', 'sas'],
  TOR: ['toronto raptors', 'raptors', 'tor'],
  UTA: ['utah jazz', 'jazz', 'uta'],
  WAS: ['washington wizards', 'wizards', 'was']
};

export const normalizeTeamName = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const getTeamAliasKey = (nameOrAbbrev: string): string => {
  const normalized = normalizeTeamName(nameOrAbbrev);
  for (const [abbrev, aliases] of Object.entries(TEAM_ALIASES)) {
    if (normalizeTeamName(abbrev) === normalized || aliases.some((alias) => normalizeTeamName(alias) === normalized)) {
      return abbrev;
    }
  }
  return normalized.toUpperCase();
};

export const buildMatchupKey = (home: string, away: string): string => {
  const homeKey = getTeamAliasKey(home);
  const awayKey = getTeamAliasKey(away);
  return `${awayKey}@${homeKey}`;
};
