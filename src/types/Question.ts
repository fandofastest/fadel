export interface Choice {
  _id: string;
  text: string;
  image?: string;
}

export interface Question {
  _id: string;
  text: string;
  image?: string;
  choices: Choice[];
  correctAnswer: string;
  exam: string;
  createdAt: Date;
  updatedAt: Date;
} 