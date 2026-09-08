// Line items attached to an event. Each category can hold several rows,
// stored as a JSON array on the event so nothing else in the schema changes.

export interface MusicianLine {
  name: string;
  instrument: string;
  phone: string;
  fee: number;
}

export interface ProviderLine {
  name: string;
  phone: string;
  /** Service type key from EQUIPMENT_TYPES */
  service: string;
  cost: number;
}

export interface ColleagueLine {
  name: string;
  /** dj | showman | singer | vipMusic */
  role: string;
  phone: string;
  fee: number;
}

export const EMPTY_MUSICIAN_LINE: MusicianLine = { name: "", instrument: "", phone: "", fee: 0 };
export const EMPTY_PROVIDER_LINE: ProviderLine = { name: "", phone: "", service: "soundLight", cost: 0 };
export const EMPTY_COLLEAGUE_LINE: ColleagueLine = { name: "", role: "dj", phone: "", fee: 0 };

function parseArray<T>(raw: unknown): T[] {
  if (typeof raw !== "string" || raw.trim() === "") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/** True when a line has at least a name filled in. */
function hasName(line: { name?: string }): boolean {
  return Boolean(line?.name && line.name.trim().length > 0);
}

/**
 * Reads the musician rows for an event, falling back to the legacy
 * single-musician columns for events saved before multi-support.
 */
export function readMusicianLines(event: {
  musiciansJson?: string | null;
  musicianName?: string | null;
  musicianInstrument?: string | null;
  musicianPhone?: string | null;
  musicianFee?: number | null;
}): MusicianLine[] {
  const rows = parseArray<MusicianLine>(event.musiciansJson).filter(hasName);
  if (rows.length > 0) return rows;
  if (event.musicianName) {
    return [{
      name: event.musicianName,
      instrument: event.musicianInstrument || "",
      phone: event.musicianPhone || "",
      fee: Number(event.musicianFee) || 0,
    }];
  }
  return [];
}

export function readProviderLines(event: {
  providersJson?: string | null;
  soundLightProvider?: string | null;
  soundLightProviderPhone?: string | null;
  soundLightCost?: number | null;
}): ProviderLine[] {
  const rows = parseArray<ProviderLine>(event.providersJson).filter(hasName);
  if (rows.length > 0) return rows;
  if (event.soundLightProvider) {
    return [{
      name: event.soundLightProvider,
      phone: event.soundLightProviderPhone || "",
      service: "soundLight",
      cost: Number(event.soundLightCost) || 0,
    }];
  }
  return [];
}

export function readColleagueLines(event: {
  colleaguesJson?: string | null;
  colleagueName?: string | null;
  colleagueRole?: string | null;
  colleaguePhone?: string | null;
  colleagueFee?: number | null;
}): ColleagueLine[] {
  const rows = parseArray<ColleagueLine>(event.colleaguesJson).filter(hasName);
  if (rows.length > 0) return rows;
  if (event.colleagueName) {
    return [{
      name: event.colleagueName,
      role: event.colleagueRole || "dj",
      phone: event.colleaguePhone || "",
      fee: Number(event.colleagueFee) || 0,
    }];
  }
  return [];
}

/** Drops empty rows and serialises for storage. */
export function serialiseLines<T extends { name: string }>(lines: T[]): string | null {
  const cleaned = lines.filter(hasName);
  return cleaned.length > 0 ? JSON.stringify(cleaned) : null;
}

export function sumFees(lines: { fee?: number; cost?: number }[]): number {
  return lines.reduce((total, l) => total + (Number(l.fee ?? l.cost) || 0), 0);
}
