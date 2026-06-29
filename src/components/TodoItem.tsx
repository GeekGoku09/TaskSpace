import React from 'react';
import { Calendar, Tag, AlertCircle, ChevronRight, Trash2, CheckCircle2, Circle, ListTodo, FileText } from 'lucide-react';
import { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggleComplete, onDelete }) => {
  const completedSubtasks = todo.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = todo.subtasks.length;

  // Formatting date nicely
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const priorityColors = {
    low: {
      text: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-green-100',
      dot: 'bg-green-500',
    },
    medium: {
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      dot: 'bg-amber-500',
    },
    high: {
      text: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-100',
      dot: 'bg-red-500',
    },
  };

  const selectedPriority = priorityColors[todo.priority] || priorityColors.medium;

  return (
    <div
      id={`todo-card-${todo.id}`}
      className={`p-4 rounded-xl border bg-white shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        todo.completed ? 'border-gray-150 bg-gray-50/70' : 'border-gray-200'
      }`}
    >
      {/* Left side: Checkbox + Title / Badges */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <button
          onClick={() => onToggleComplete(todo.id, !todo.completed)}
          className={`mt-0.5 shrink-0 rounded-full cursor-pointer focus:outline-hidden text-gray-400 hover:text-indigo-600 transition-colors duration-200`}
          title={todo.completed ? 'Mark incomplete' : 'Mark complete'}
          id={`toggle-${todo.id}`}
        >
          {todo.completed ? (
            <CheckCircle2 className="h-5 w-5 text-indigo-600 fill-indigo-50" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-sm font-semibold text-gray-900 truncate max-w-[80%] ${
                todo.completed ? 'line-through text-gray-400' : ''
              }`}
            >
              {todo.title}
            </h3>

            {/* Priority Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold border capitalize ${selectedPriority.text} ${selectedPriority.bg} ${selectedPriority.border}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${selectedPriority.dot}`}></span>
              {todo.priority}
            </span>

            {/* Category Badge */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold border text-indigo-700 bg-indigo-50/50 border-indigo-100">
              <Tag className="h-3 w-3" />
              {todo.category}
            </span>
          </div>

          {todo.description && (
            <p className={`text-xs text-gray-500 line-clamp-1 ${todo.completed ? 'text-gray-400' : ''}`}>
              {todo.description}
            </p>
          )}

          {/* Subtask & Due Date Metadata row */}
          <div className="flex flex-wrap items-center gap-3 text-3xs font-mono text-gray-400">
            {/* Due date */}
            {todo.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                {formatDate(todo.dueDate)}
              </span>
            )}

            {/* Subtasks progress */}
            {totalSubtasks > 0 && (
              <span className="flex items-center gap-1 text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md font-semibold">
                <ListTodo className="h-3 w-3" />
                {completedSubtasks}/{totalSubtasks} Subtasks
              </span>
            )}

            {/* Notes Indicator */}
            {todo.notes && (
              <span className="flex items-center gap-1" title="Has notes">
                <FileText className="h-3 w-3 text-gray-400" />
                Notes
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Action Buttons */}
      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
        {/* Full Details Page Link (Multi-Page reload) */}
        <a
          href={`/todo?id=${todo.id}`}
          className="inline-flex items-center gap-1 py-1.5 px-3 bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 border border-gray-200 hover:border-indigo-150 text-xs font-semibold rounded-lg transition duration-200"
          id={`details-link-${todo.id}`}
        >
          View Details
          <ChevronRight className="h-3.5 w-3.5" />
        </a>

        {/* Delete button */}
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this task?')) {
              onDelete(todo.id);
            }
          }}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition duration-200 cursor-pointer"
          title="Delete task"
          id={`delete-${todo.id}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
