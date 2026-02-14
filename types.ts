
export enum Difficulty {
  EASY = 'Dễ',
  MEDIUM = 'Trung bình',
  HARD = 'Khó (Nâng cao)'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'Trắc nghiệm',
  FILL_IN_THE_BLANK = 'Điền vào chỗ trống',
  CALCULATION = 'Đặt tính rồi tính',
  WORD_PROBLEM = 'Bài toán có lời văn'
}

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface TestConfig {
  topics: string[];
  count: number;
  difficulty: Difficulty;
  title: string;
}

export interface MathTest {
  title: string;
  questions: Question[];
  createdAt: string;
}
