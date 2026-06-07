export type Priority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  title: string;
  priority: Priority;
  estimateMin: number;
  deadline: string;          // YYYY-MM-DD
  reminderAt?: string;       // ISO datetime
  done: boolean;
  createdAt: string;         // ISO datetime
  completedAt?: string;      // ISO datetime — set when toggled to done
  pinnedToToday?: boolean;
  project?: string;
};
