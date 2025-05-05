export interface Exam {
  _id: string;
  title: string;
  description?: string;
  questions: string[];
  durationMinutes: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
} 