import { getPipeRule, getRuleForRoom, type RoomCategory, type SlopeRule } from './drainSlopeRules'

export type ValidationStatus = 'ok' | 'warning' | 'error' | 'info'

export interface CalculationInput {
  roomCategory: RoomCategory
  zone?: 'dusch' | 'ovrig'
  distanceM: number
  distanceToWallMm?: number
  plannedSlopeMmPerM?: number
  pipeDiameter?: string
  pipeLengthM?: number
}

export interface CalculationResult {
  rule: SlopeRule
  recommendedMmPerM: number
  minMmPerM: number
  maxMmPerM?: number
  ratioRecommended: string
  ratioMin: string
  ratioMax?: string
  promilleRecommended: number
  heightDiffRecommendedMm: number
  heightDiffMinMm: number
  heightDiffMaxMm?: number
  validation?: {
    status: ValidationStatus
    message: string
    plannedMmPerM: number
    plannedRatio: string
    plannedHeightDiffMm: number
  }
  wallValidation?: {
    status: ValidationStatus
    message: string
    distanceMm: number
    requiredMinMm: number
  }
  plushojdValidation?: {
    status: ValidationStatus
    message: string
    requiredMinMm: number
  }
}

export function mmPerMToRatio(mmPerM: number): string {
  if (mmPerM <= 0) return '—'
  const ratio = Math.round(1000 / mmPerM)
  return `1:${ratio}`
}

export function mmPerMToPercent(mmPerM: number): string {
  return `${(mmPerM / 10).toFixed(2)} %`
}

export function calculateHeightDiff(distanceM: number, mmPerM: number): number {
  return Math.round(distanceM * mmPerM * 10) / 10
}

export function validateSlopeValue(
  actualMmPerM: number,
  rule: SlopeRule,
): { status: ValidationStatus; message: string } {
  const min = rule.minMmPerM
  const max = rule.maxMmPerM

  if (actualMmPerM < min) {
    return {
      status: 'error',
      message: `För lågt fall. Minst ${min} mm/m (${mmPerMToRatio(min)}) krävs enligt ${rule.sources[0]}.`,
    }
  }

  if (max !== undefined && actualMmPerM > max) {
    return {
      status: 'error',
      message: `För brant lutning. Högst ${max} mm/m (${mmPerMToRatio(max)}) tillåts enligt ${rule.sources[0]}.`,
    }
  }

  const diffFromRecommended = Math.abs(actualMmPerM - rule.recommendedMmPerM)
  if (diffFromRecommended <= 2) {
    return {
      status: 'ok',
      message: `Inom tillåtet intervall och nära riktvärdet ${rule.recommendedMmPerM} mm/m.`,
    }
  }

  return {
    status: 'ok',
    message: `Inom tillåtet intervall (${min}–${max ?? '∞'} mm/m). Riktvärde: ${rule.recommendedMmPerM} mm/m.`,
  }
}

export function calculateDrainSlope(input: CalculationInput): CalculationResult {
  const { roomCategory, zone, distanceM, distanceToWallMm, plannedSlopeMmPerM, pipeDiameter, pipeLengthM } =
    input

  let rule: SlopeRule
  let recommendedMmPerM: number
  let minMmPerM: number
  let maxMmPerM: number | undefined

  if (roomCategory === 'spillvattenror' && pipeDiameter) {
    const pipeRule = getPipeRule(pipeDiameter)
    if (pipeRule) {
      minMmPerM = pipeRule.minPromille
      recommendedMmPerM = pipeRule.minPromille
      maxMmPerM = undefined
      rule = {
        ...getRuleForRoom('spillvattenror'),
        minMmPerM,
        recommendedMmPerM,
        label: `Spillvattenrör ${pipeRule.label}`,
      }
    } else {
      rule = getRuleForRoom('spillvattenror')
      minMmPerM = rule.minMmPerM
      recommendedMmPerM = rule.recommendedMmPerM
      maxMmPerM = rule.maxMmPerM
    }
  } else {
    rule = getRuleForRoom(roomCategory, zone)
    minMmPerM = rule.minMmPerM
    recommendedMmPerM = rule.recommendedMmPerM
    maxMmPerM = rule.maxMmPerM
  }

  const effectiveDistance = roomCategory === 'spillvattenror' && pipeLengthM ? pipeLengthM : distanceM

  const result: CalculationResult = {
    rule,
    recommendedMmPerM,
    minMmPerM,
    maxMmPerM,
    ratioRecommended: mmPerMToRatio(recommendedMmPerM),
    ratioMin: mmPerMToRatio(minMmPerM),
    ratioMax: maxMmPerM !== undefined ? mmPerMToRatio(maxMmPerM) : undefined,
    promilleRecommended: recommendedMmPerM,
    heightDiffRecommendedMm: calculateHeightDiff(effectiveDistance, recommendedMmPerM),
    heightDiffMinMm: calculateHeightDiff(effectiveDistance, minMmPerM),
    heightDiffMaxMm: maxMmPerM !== undefined ? calculateHeightDiff(effectiveDistance, maxMmPerM) : undefined,
  }

  if (plannedSlopeMmPerM !== undefined && plannedSlopeMmPerM > 0) {
    const validation = validateSlopeValue(plannedSlopeMmPerM, { ...rule, minMmPerM, maxMmPerM, recommendedMmPerM })
    result.validation = {
      ...validation,
      plannedMmPerM: plannedSlopeMmPerM,
      plannedRatio: mmPerMToRatio(plannedSlopeMmPerM),
      plannedHeightDiffMm: calculateHeightDiff(effectiveDistance, plannedSlopeMmPerM),
    }
  }

  if (distanceToWallMm !== undefined && rule.minWallDistanceMm !== undefined) {
    if (distanceToWallMm >= rule.minWallDistanceMm) {
      result.wallValidation = {
        status: 'ok',
        message: `Avståndet ${distanceToWallMm} mm uppfyller kravet på minst ${rule.minWallDistanceMm} mm till vägg.`,
        distanceMm: distanceToWallMm,
        requiredMinMm: rule.minWallDistanceMm,
      }
    } else {
      result.wallValidation = {
        status: 'error',
        message: `Avståndet ${distanceToWallMm} mm är för kort. Minst ${rule.minWallDistanceMm} mm krävs enligt Säker Vatten.`,
        distanceMm: distanceToWallMm,
        requiredMinMm: rule.minWallDistanceMm,
      }
    }
  }

  if (rule.minPlushojdMm !== undefined) {
    result.plushojdValidation = {
      status: 'info',
      message: `Kontrollera att plushöjd är minst ${rule.minPlushojdMm} mm för självfall.`,
      requiredMinMm: rule.minPlushojdMm,
    }
  }

  return result
}

export function formatMm(value: number): string {
  return `${value.toLocaleString('sv-SE', { maximumFractionDigits: 1 })} mm`
}

export function formatDistanceM(value: number): string {
  return `${value.toLocaleString('sv-SE', { maximumFractionDigits: 2 })} m`
}
