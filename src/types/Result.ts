export interface Answer {
  question: string;
  answer: string;
}

export interface Result {
  _id: string;
  user: string;
  exam: string;
  answers: Answer[];
  score: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
} 