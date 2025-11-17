
import { Evaluation, Worker, Foreman } from '@/types';

export const getBiweeklyPeriods = (startDate: Date, endDate: Date): Date[] => {
  const periods: Date[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    periods.push(new Date(current));
    current.setDate(current.getDate() + 14); // Add 14 days for biweekly
  }
  
  return periods;
};

export const getNextBiweeklyDate = (lastEvaluationDate?: Date): Date => {
  const baseDate = lastEvaluationDate || new Date();
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + 14);
  return nextDate;
};

export const getBiweeklyEvaluations = (evaluations: Evaluation[]): Evaluation[] => {
  return evaluations.filter(evaluation => evaluation.period === 'biweekly');
};

export const getEvaluationsInDateRange = (
  evaluations: Evaluation[], 
  startDate: Date, 
  endDate: Date
): Evaluation[] => {
  return evaluations.filter(evaluation => {
    const evalDate = new Date(evaluation.date);
    return evalDate >= startDate && evalDate <= endDate;
  });
};

export const generateScatterPlotData = (
  workers: Worker[], 
  foremen: Foreman[]
): Array<{
  workerId: string;
  workerName: string;
  foremanName: string;
  date: string;
  score: number;
  rating: 'A' | 'B' | 'C';
}> => {
  const data: Array<{
    workerId: string;
    workerName: string;
    foremanName: string;
    date: string;
    score: number;
    rating: 'A' | 'B' | 'C';
  }> = [];

  workers.forEach(worker => {
    const foreman = foremen.find(f => f.id === worker.foremanId);
    const biweeklyEvaluations = getBiweeklyEvaluations(worker.evaluations);
    
    biweeklyEvaluations.forEach(evaluation => {
      data.push({
        workerId: worker.id,
        workerName: worker.name,
        foremanName: foreman?.name || 'Unknown',
        date: new Date(evaluation.date).toLocaleDateString(),
        score: evaluation.totalScore,
        rating: evaluation.rating
      });
    });
  });

  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
