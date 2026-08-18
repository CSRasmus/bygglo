export type RoomCategory =
  | 'badrum_dusch'
  | 'badrum_ovrig'
  | 'tvattstuga'
  | 'storkok'
  | 'garage'
  | 'tvatthall'
  | 'spillvattenror'

export type DrainType =
  | 'centrerad'
  | 'vaggnaara'
  | 'linjebrunn'
  | 'storkoksbrunn'

export interface SlopeRule {
  id: RoomCategory
  label: string
  description: string
  minMmPerM: number
  maxMmPerM?: number
  recommendedMmPerM: number
  maxToWallMmPerM?: number
  minWallDistanceMm?: number
  minPlushojdMm?: number
  sources: string[]
  sourceUrls?: string[]
  notes?: string[]
}

export interface RoomOption {
  id: RoomCategory
  label: string
  shortLabel: string
  description: string
  icon: string
  ruleIds: RoomCategory[]
}

export interface DrainOption {
  id: DrainType
  label: string
  description: string
  applicableRooms: RoomCategory[]
}

export const SLOPE_RULES: Record<RoomCategory, SlopeRule> = {
  badrum_dusch: {
    id: 'badrum_dusch',
    label: 'Duschplats / våtzon',
    description: 'Golv i duschplats eller motsvarande våt yta',
    minMmPerM: 7,
    maxMmPerM: 30,
    recommendedMmPerM: 15,
    maxToWallMmPerM: 40,
    minWallDistanceMm: 200,
    sources: ['GVK Säkra Våtrum 2026 §6.4.3', 'Säker Vatten BBV 26:1'],
    sourceUrls: [
      'https://www.gvk.se/nyheter/2025/uppdaterade-branschregler-sakra-vatrum-2026-nya-falltoleranser-for-golvlutning-i-duschplatser-eller-motsvarande/',
    ],
    notes: [
      'Riktvärde vid projektering: ca 15 mm/m för att hamna inom tolerans vid färdigt utförande.',
      'Inom 0,5 m från brunnen krävs tillräckligt fall för att bryta ytspänning (minst 1:150).',
    ],
  },
  badrum_ovrig: {
    id: 'badrum_ovrig',
    label: 'Övrig yta i våtrum',
    description: 'Golv utanför duschplats i badrum eller WC',
    minMmPerM: 2,
    maxMmPerM: 10,
    recommendedMmPerM: 5,
    minWallDistanceMm: 200,
    sources: ['GVK Säkra Våtrum 2026 §6.4.3'],
    notes: ['Brunnens fläns i duschplats ska ligga minst 20 mm under tätskiktets uppvik vid dörröppning.'],
  },
  tvattstuga: {
    id: 'tvattstuga',
    label: 'Tvättstuga',
    description: 'Golv i tvättstuga med golvbrunn',
    minMmPerM: 2,
    maxMmPerM: 10,
    recommendedMmPerM: 5,
    minWallDistanceMm: 200,
    sources: ['GVK Säkra Våtrum 2026', 'Säker Vatten BBV 26:1'],
  },
  storkok: {
    id: 'storkok',
    label: 'Storkök / restaurangkök',
    description: 'Golvavrinning i storkök med höga flöden',
    minMmPerM: 10,
    recommendedMmPerM: 10,
    minPlushojdMm: 100,
    sources: ['Branschpraxis storkök', 'Livsmedelsverkets hygienkrav'],
    notes: [
      'Minst 1:100 (10 mm/m) mot avloppspunkter rekommenderas.',
      'Plushöjd minst 100 mm för DN upp till 100 för självfall.',
      'Brunnar ska klara höga temperaturer och fetthaltigt avloppsvatten.',
    ],
  },
  garage: {
    id: 'garage',
    label: 'Garage / förråd',
    description: 'Golvavrinning i garage eller förråd',
    minMmPerM: 10,
    recommendedMmPerM: 10,
    sources: ['AMA VVS & Kyla', 'BBR 6 kap.'],
    notes: ['Minst 1:100 mot golvbrunn eller avloppspunkter.'],
  },
  tvatthall: {
    id: 'tvatthall',
    label: 'Tvätthall / industri',
    description: 'Golvavrinning i tvätthall eller liknande',
    minMmPerM: 10,
    recommendedMmPerM: 10,
    sources: ['AMA VVS & Kyla', 'Branschpraxis'],
  },
  spillvattenror: {
    id: 'spillvattenror',
    label: 'Spillvattenrör (liggande)',
    description: 'Lutning på liggande spillvattenledning med självfall',
    minMmPerM: 9,
    recommendedMmPerM: 9,
    sources: ['AMA VVS & Kyla 25', 'Säker Vatten BBV 26:1 §4.4.1', 'Leverantörsanvisningar'],
    notes: ['Spillvattenledning ska förläggas med fall i hela ledningens längd.'],
  },
}

export const PIPE_SLOPE_RULES: Record<string, { minPromille: number; label: string }> = {
  DN50: { minPromille: 20, label: 'DN 50' },
  DE75: { minPromille: 14, label: 'DE 75 / DN 75' },
  DN75: { minPromille: 14, label: 'DE 75 / DN 75' },
  DN100: { minPromille: 9, label: 'DN 100' },
  DN110: { minPromille: 9, label: 'DN 110' },
}

export const ROOM_OPTIONS: RoomOption[] = [
  {
    id: 'badrum_dusch',
    label: 'Badrum',
    shortLabel: 'Badrum',
    description: 'Våtrum med golvbrunn – duschplats och övrig yta',
    icon: 'shower',
    ruleIds: ['badrum_dusch', 'badrum_ovrig'],
  },
  {
    id: 'tvattstuga',
    label: 'Tvättstuga',
    shortLabel: 'Tvättstuga',
    description: 'Tvättstuga med golvbrunn och avrinning',
    icon: 'washing',
    ruleIds: ['tvattstuga'],
  },
  {
    id: 'storkok',
    label: 'Storkök',
    shortLabel: 'Storkök',
    description: 'Restaurangkök, storhushåll, storköksbrunnar',
    icon: 'chef',
    ruleIds: ['storkok'],
  },
  {
    id: 'garage',
    label: 'Garage',
    shortLabel: 'Garage',
    description: 'Garage, förråd och liknande utrymmen',
    icon: 'car',
    ruleIds: ['garage'],
  },
  {
    id: 'tvatthall',
    label: 'Tvätthall',
    shortLabel: 'Tvätthall',
    description: 'Industri, tvätthall och serviceutrymmen',
    icon: 'factory',
    ruleIds: ['tvatthall'],
  },
  {
    id: 'spillvattenror',
    label: 'Spillvattenrör',
    shortLabel: 'Rör',
    description: 'Lutning på liggande avloppsrör (DN 50–110)',
    icon: 'pipe',
    ruleIds: ['spillvattenror'],
  },
]

export const DRAIN_OPTIONS: DrainOption[] = [
  {
    id: 'centrerad',
    label: 'Centrerad golvbrunn',
    description: 'Standard golvbrunn placerad på golvyta',
    applicableRooms: ['badrum_dusch', 'badrum_ovrig', 'tvattstuga', 'garage', 'tvatthall'],
  },
  {
    id: 'vaggnaara',
    label: 'Väggnära brunn',
    description: 'Typgodkänd väggnära golvbrunn',
    applicableRooms: ['badrum_dusch', 'badrum_ovrig'],
  },
  {
    id: 'linjebrunn',
    label: 'Linjebrunn / galler',
    description: 'Linjeformad avrinning längs vägg eller golv',
    applicableRooms: ['badrum_dusch', 'storkok'],
  },
  {
    id: 'storkoksbrunn',
    label: 'Storköksbrunn',
    description: 'Rostfri storköksbrunn med fetthalt',
    applicableRooms: ['storkok'],
  },
]

export function getRuleForRoom(
  roomCategory: RoomCategory,
  zone?: 'dusch' | 'ovrig',
): SlopeRule {
  if (roomCategory === 'badrum_dusch' || (roomCategory === 'badrum_ovrig' && zone)) {
    return zone === 'ovrig' ? SLOPE_RULES.badrum_ovrig : SLOPE_RULES.badrum_dusch
  }
  return SLOPE_RULES[roomCategory]
}

export function getPipeRule(diameter: string): { minPromille: number; label: string } | undefined {
  return PIPE_SLOPE_RULES[diameter]
}
