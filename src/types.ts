export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  subtasks: SubTask[];
  notes: string;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  highPriority: number;
  byCategory: Record<string, number>;
}
