import { DifficultyLevel } from '../types';

export const DIFFICULTY_TIERS: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

export interface DifficultyAdjustmentResult {
  previousDifficulty: DifficultyLevel;
  newDifficulty: DifficultyLevel;
  action: 'INCREASED' | 'DECREASED' | 'MAINTAINED';
  reason: string;
}

export function calculateAdaptiveDifficulty(
  currentDifficulty: DifficultyLevel,
  overallScore: number
): DifficultyAdjustmentResult {
  const currentIndex = DIFFICULTY_TIERS.indexOf(currentDifficulty);
  const safeIndex = currentIndex >= 0 ? currentIndex : 2;

  if (overallScore >= 85 && safeIndex < DIFFICULTY_TIERS.length - 1) {
    const newDifficulty = DIFFICULTY_TIERS[safeIndex + 1];
    return {
      previousDifficulty: currentDifficulty,
      newDifficulty,
      action: 'INCREASED',
      reason: `Exceptional response quality (${overallScore}/100); escalating difficulty to ${newDifficulty.toUpperCase()}.`,
    };
  }

  if (overallScore < 50 && safeIndex > 0) {
    const newDifficulty = DIFFICULTY_TIERS[safeIndex - 1];
    return {
      previousDifficulty: currentDifficulty,
      newDifficulty,
      action: 'DECREASED',
      reason: `Identified knowledge gaps (${overallScore}/100); adjusting challenge tier to ${newDifficulty.toUpperCase()}.`,
    };
  }

  return {
    previousDifficulty: currentDifficulty,
    newDifficulty: currentDifficulty,
    action: 'MAINTAINED',
    reason: `Steady performance (${overallScore}/100); maintaining ${currentDifficulty.toUpperCase()} tier.`,
  };
}
