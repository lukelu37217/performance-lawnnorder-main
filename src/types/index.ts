export interface Worker {
  id: string;
  name: string;
  foremanId: string;
  evaluations: Evaluation[];
  createdAt: Date;
}

export interface Foreman {
  id: string;
  name: string;
  managerId?: string; // New: Foremen can report to Managers
  createdAt: Date;
  evaluations?: Evaluation[]; // Foremen can also be evaluated
}

export interface Manager {
  id: string;
  name: string;
  leaderId?: string; // New: Managers can report to Leaders
  createdAt: Date;
  evaluations?: Evaluation[];
}

export interface Leader {
  id: string;
  name: string;
  createdAt: Date;
  evaluations?: Evaluation[];
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'leader' | 'manager' | 'foreman';
  email: string;
  password: string; // In production, this would be hashed
  entityId: string; // References the specific Leader/Manager/Foreman ID
  createdAt: Date;
  isActive: boolean;
  isPending?: boolean; // For pending approval status
  status: 'pending' | 'approved' | 'disabled'; // New: User approval status
}

export interface AuthUser {
  id: string;
  name: string;
  role: 'admin' | 'leader' | 'manager' | 'foreman';
  entityId: string;
}

export interface Evaluation {
  id: string;
  workerId?: string; // Optional for foreman evaluations
  foremanId?: string; // New: For evaluating foremen
  evaluatorId: string;
  evaluatorRole: 'leader' | 'manager' | 'foreman';
  evaluateeType: 'worker' | 'foreman';
  date: Date;
  period: 'biweekly';
  scores: {
    projectCompletion: number;
    qualityIssues: number;
    toolCare: number;
    equipmentEtiquette: number;
    nearMiss: number;
    incident: number;
    attendance: number;
    attitude: number;
    taskOwnership: number;
    customerInteraction: number;
    teamwork: number;
  };
  totalScore: number;
  rating: 'A' | 'B' | 'C';
  notes?: string;
  biweeklyPeriod: number;
}

export interface CategoryScore {
  name: string;
  score: number;
  maxScore: number;
  indicators: IndicatorScore[];
}

export interface IndicatorScore {
  name: string;
  score: number;
  maxScore: number;
}

export interface DashboardFilters {
  foremanId?: string;
  workerId?: string;
  managerId?: string;
  leaderId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  evaluatorRole?: 'leader' | 'manager' | 'foreman';
  evaluateeType?: 'worker' | 'foreman';
}

export interface ScatterPlotData {
  workerId?: string;
  foremanId?: string;
  workerName?: string;
  foremanName?: string;
  managerName?: string;
  date: string;
  score: number;
  rating: 'A' | 'B' | 'C';
  evaluatorRole: 'leader' | 'manager' | 'foreman';
  evaluateeType: 'worker' | 'foreman';
}

export interface BiweeklyPeriod {
  periodNumber: number;
  startDate: Date;
  endDate: Date;
  isCurrentPeriod: boolean;
  daysUntilDeadline: number;
}

export interface ReminderSettings {
  enabled: boolean;
  daysBeforeDeadline: number;
  emailNotifications: boolean;
  inAppNotifications: boolean;
}

export interface PerformanceMetrics {
  averageScore: number;
  ratingDistribution: {
    A: number;
    B: number;
    C: number;
  };
  improvementTrend: number;
  completionRate: number;
}
