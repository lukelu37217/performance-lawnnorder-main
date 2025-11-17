
import { Evaluation } from '@/types';

export const calculateTotalScore = (scores: Evaluation['scores']): number => {
  return Object.values(scores).reduce((total, score) => total + score, 0);
};

export const calculateRating = (totalScore: number): 'A' | 'B' | 'C' => {
  if (totalScore >= 27) return 'A';
  if (totalScore >= 20) return 'B';
  return 'C';
};

export const getRatingDescription = (rating: 'A' | 'B' | 'C'): string => {
  switch (rating) {
    case 'A':
      return 'Strong ownership, high-quality work, promotion potential';
    case 'B':
      return 'Reliable, fulfills responsibilities, room to grow';
    case 'C':
      return 'Gaps in quality or behavior, needs coaching';
  }
};

export const getCategoryScore = (scores: Evaluation['scores'], category: string) => {
  switch (category) {
    case 'Performance':
      return {
        score: scores.projectCompletion + scores.qualityIssues + scores.toolCare + scores.equipmentEtiquette,
        maxScore: 12
      };
    case 'Safety':
      return {
        score: scores.nearMiss + scores.incident,
        maxScore: 6
      };
    case 'Behavior & Attitude':
      return {
        score: scores.attendance + scores.attitude + scores.taskOwnership,
        maxScore: 9
      };
    case 'Teamwork & Customer Interaction':
      return {
        score: scores.customerInteraction + scores.teamwork,
        maxScore: 6
      };
    default:
      return { score: 0, maxScore: 0 };
  }
};
