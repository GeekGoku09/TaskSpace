import React, { useState } from 'react';
import { Plus, Tag, Calendar, AlertCircle, PlusCircle, Trash2, X } from 'lucide-react';
import { Priority, SubTask } from '../types';

interface AddTodoFormProps {
  onAdd: (todo: {
    title: string;
    description: string;
    priority: Priority;
    category: string;
    dueDate: string;
    subtasks: { title: string; completed: boolean }[];
    notes: string;
  }) => Promise<void>;
}

export const AddTodoForm: React.FC<AddTodoFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('Personal');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Local subtasks list being constructed
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (subtaskInput.trim()) {
      setSubtasks([...subtasks, subtaskInput.trim()]);
      setSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setLoading(true);
    try {
      await onAdd({
        title,
        description,
        priority,
        category,
        dueDate,
        subtasks: subtasks.map((st) => ({ title: st, completed: false })),
        notes,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('Personal');
      setDueDate('');
      setNotes('');
      setSubtasks([]);
    } catch (err) {
      setError('Failed to add todo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs" id="add-todo-form">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <PlusCircle className="h-5 w-5 text-indigo-600" />
        Create New Task
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100" id="form-error">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1" htmlFor="todo-title">
            Task Title *
          </label>
          <input
            id="todo-title"
            type="text"
            placeholder="e.g. Finish project proposal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1" htmlFor="todo-desc">
            Description
          </label>
          <textarea
            id="todo-desc"
            placeholder="Describe the task..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 resize-none"
          />
        </div>

        {/* Priority, Category, Due Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1" htmlFor="todo-priority">
              Priority
            </label>
            <select
              id="todo-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 bg-white"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1" htmlFor="todo-category">
              Category
            </label>
            <select
              id="todo-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 bg-white"
            >
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Shopping">Shopping</option>
              <option value="Home">Home</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1" htmlFor="todo-due-date">
              Due Date
            </label>
            <input
              id="todo-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-300 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 bg-white"
            />
          </div>
        </div>

        {/* Subtasks Builder */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1" htmlFor="todo-subtasks">
            Subtasks / Action Items
          </label>
          <div className="flex gap-2">
            <input
              id="todo-subtasks"
              type="text"
              placeholder="Add subtask item..."
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask(e);
                }
              }}
              className="flex-1 px-3.5 py-1.5 rounded-lg border border-gray-300 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition duration-200 flex items-center gap-1 border border-gray-300"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>

          {subtasks.length > 0 && (
            <div className="mt-2.5 space-y-1 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
              {subtasks.map((st, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-2xs">
                  <span className="text-xs text-gray-700 font-medium truncate max-w-[80%]">{st}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(idx)}
                    className="text-gray-400 hover:text-red-500 transition duration-200 p-0.5 rounded-full hover:bg-red-50"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1" htmlFor="todo-notes">
            Additional Notes
          </label>
          <textarea
            id="todo-notes"
            placeholder="Any extra files, links, or instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg shadow-sm transition duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
          id="submit-todo-button"
        >
          {loading ? (
            <span>Adding Task...</span>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add Task
            </>
          )}
        </button>
      </div>
    </form>
  );
};
