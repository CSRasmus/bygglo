import { describe, it, expect } from 'vitest'
import {
  calculateDrainSlope,
  mmPerMToRatio,
  calculateHeightDiff,
  validateSlopeValue,
} from './drainSlopeCalc'
import { SLOPE_RULES } from './drainSlopeRules'

describe('mmPerMToRatio', () => {
  it('converts 15 mm/m to 1:67', () => {
    expect(mmPerMToRatio(15)).toBe('1:67')
  })

  it('converts 10 mm/m to 1:100', () => {
    expect(mmPerMToRatio(10)).toBe('1:100')
  })

  it('converts 7 mm/m to 1:143', () => {
    expect(mmPerMToRatio(7)).toBe('1:143')
  })
})

describe('calculateHeightDiff', () => {
  it('calculates height difference correctly', () => {
    expect(calculateHeightDiff(2, 15)).toBe(30)
    expect(calculateHeightDiff(1.5, 10)).toBe(15)
  })
})

describe('validateSlopeValue', () => {
  it('accepts value within range', () => {
    const result = validateSlopeValue(15, SLOPE_RULES.badrum_dusch)
    expect(result.status).toBe('ok')
  })

  it('rejects value below minimum', () => {
    const result = validateSlopeValue(5, SLOPE_RULES.badrum_dusch)
    expect(result.status).toBe('error')
  })

  it('rejects value above maximum', () => {
    const result = validateSlopeValue(35, SLOPE_RULES.badrum_dusch)
    expect(result.status).toBe('error')
  })
})

describe('calculateDrainSlope', () => {
  it('calculates bathroom shower slope', () => {
    const result = calculateDrainSlope({
      roomCategory: 'badrum_dusch',
      zone: 'dusch',
      distanceM: 2,
    })
    expect(result.recommendedMmPerM).toBe(15)
    expect(result.minMmPerM).toBe(7)
    expect(result.maxMmPerM).toBe(30)
    expect(result.heightDiffRecommendedMm).toBe(30)
  })

  it('calculates storkök slope', () => {
    const result = calculateDrainSlope({
      roomCategory: 'storkok',
      distanceM: 3,
    })
    expect(result.recommendedMmPerM).toBe(10)
    expect(result.heightDiffRecommendedMm).toBe(30)
    expect(result.plushojdValidation).toBeDefined()
  })

  it('calculates pipe slope for DN100', () => {
    const result = calculateDrainSlope({
      roomCategory: 'spillvattenror',
      distanceM: 1,
      pipeDiameter: 'DN100',
      pipeLengthM: 5,
    })
    expect(result.minMmPerM).toBe(9)
    expect(result.heightDiffRecommendedMm).toBe(45)
  })

  it('validates planned slope', () => {
    const result = calculateDrainSlope({
      roomCategory: 'badrum_dusch',
      zone: 'dusch',
      distanceM: 2,
      plannedSlopeMmPerM: 15,
    })
    expect(result.validation?.status).toBe('ok')
    expect(result.validation?.plannedHeightDiffMm).toBe(30)
  })

  it('validates wall distance', () => {
    const result = calculateDrainSlope({
      roomCategory: 'badrum_dusch',
      zone: 'dusch',
      distanceM: 2,
      distanceToWallMm: 150,
    })
    expect(result.wallValidation?.status).toBe('error')
  })
})
