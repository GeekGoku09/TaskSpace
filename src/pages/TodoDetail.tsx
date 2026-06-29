import React, { useState, useEffect } from 'react';
import { ArrowLeft, Tag, Calendar, AlertCircle, Trash2, CheckCircle2, Circle, ListTodo, FileText, Check, Edit, Save, X, Plus, PlayCircle } from 'lucide-react';
import { Todo, Priority, SubTask } from '../types';

export const TodoDetail: React.FC = () => {
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit mode states
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');
  const [editCategory, setEditCategory] = useState('Personal');
  const [editDueDate, setEditDueDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Adding new subtask state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const getTodoId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  };

  const fetchTodo = async () => {
    const id = getTodoId();
    if (!id) {
      setError('No task ID specified in the URL.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/todos/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Task not found');
        }
        throw new Error('Failed to load task details');
      }
      const data = await res.json();
      setTodo(data);
      
      // Seed edit form
      setEditTitle(data.title);
      setEditDescription(data.description);
      setEditPriority(data.priority);
      setEditCategory(data.category);
      setEditDueDate(data.dueDate);
      setEditNotes(data.notes);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodo();
  }, []);

  // Update Todo Handler (General)
  const handleUpdate = async (updatedFields: Partial<Todo>) => {
    if (!todo) return;
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });

      if (!res.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTodo = await res.json();
      setTodo(updatedTodo);
    } catch (err) {
      alert('Error updating task: ' + err);
    }
  };

  // Toggle subtask completion status
  const handleToggleSubtask = async (subtaskId: string) => {
    if (!todo) return;
    const updatedSubtasks = todo.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    await handleUpdate({ subtasks: updatedSubtasks });
  };

  // Add subtask
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todo || !newSubtaskTitle.trim()) return;

    const newSubtask: SubTask = {
      id: Date.now().toString(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    const updatedSubtasks = [...todo.subtasks, newSubtask];
    await handleUpdate({ subtasks: updatedSubtasks });
    setNewSubtaskTitle('');
  };

  // Delete subtask
  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!todo) return;
    const updatedSubtasks = todo.subtasks.filter((st) => st.id !== subtaskId);
    await handleUpdate({ subtasks: updatedSubtasks });
  };

  // Submit edits
  const handleSaveEdits = async () => {
    if (!editTitle.trim()) {
      alert('Task title is required.');
      return;
    }

    await handleUpdate({
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      category: editCategory,
      dueDate: editDueDate,
      notes: editNotes,
    });
    setEditMode(false);
  };

  // Toggle main todo completion status
  const handleToggleComplete = async () => {
    if (!todo) return;
    await handleUpdate({ completed: !todo.completed });
  };

  // Delete Todo entirely
  const handleDeleteTodo = async () => {
    if (!todo) return;
    if (window.confirm('Are you sure you want to permanently delete this task?')) {
      try {
        const res = await fetch(`/api/todos/${todo.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          window.location.href = '/';
        } else {
          throw new Error('Deletion failed');
        }
      } catch (err) {
        alert('Could not delete task: ' + err);
      }
    }
  };

  // Status/priority badge colors
  const priorityColors = {
    low: 'text-green-700 bg-green-50 border-green-100',
    medium: 'text-amber-700 bg-amber-50 border-amber-100',
    high: 'text-red-700 bg-red-50 border-red-100',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 text-indigo-600 mx-auto rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="text-sm font-semibold text-gray-500">Retrieving task detail records...</p>
        </div>
      </div>
    );
  }

  if (error || !todo) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full shadow-lg text-center space-y-4">
          <div className="p-3 bg-red-50 text-red-500 rounded-full inline-block border border-red-100">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Task Detail Error</h2>
          <p className="text-xs text-gray-500">{error || 'Task item details could not be found.'}</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition duration-200 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" id="todo-detail-root">
      {/* Detail Header Navigation */}
      <header className="bg-white border-b border-gray-200 py-4 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold rounded-lg transition duration-200"
            id="back-button"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (editMode) {
                  setEditMode(false);
                  // Reset form fields to saved task fields
                  setEditTitle(todo.title);
                  setEditDescription(todo.description);
                  setEditPriority(todo.priority);
                  setEditCategory(todo.category);
                  setEditDueDate(todo.dueDate);
                  setEditNotes(todo.notes);
                } else {
                  setEditMode(true);
                }
              }}
              className="inline-flex items-center gap-1 py-1.5 px-3 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 text-gray-700 hover:text-indigo-600 text-xs font-semibold rounded-lg transition duration-200 cursor-pointer"
              id="edit-mode-toggle"
            >
              {editMode ? (
                <>
                  <X className="h-3.5 w-3.5" /> Cancel
                </>
              ) : (
                <>
                  <Edit className="h-3.5 w-3.5" /> Edit Details
                </>
              )}
            </button>

            <button
              onClick={handleDeleteTodo}
              className="inline-flex items-center gap-1 py-1.5 px-3 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 text-red-700 text-xs font-semibold rounded-lg transition duration-200 cursor-pointer"
              id="delete-task-button"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Task
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Progress and status banner */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white ${todo.completed ? 'border-indigo-100 bg-indigo-50/25' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleComplete}
              className="shrink-0 focus:outline-hidden text-gray-400 hover:text-indigo-600 transition duration-150 cursor-pointer"
              id="toggle-complete-banner"
            >
              {todo.completed ? (
                <CheckCircle2 className="h-7 w-7 text-indigo-600 fill-indigo-50" />
              ) : (
                <Circle className="h-7 w-7 text-gray-300" />
              )}
            </button>
            <div>
              <p className="text-3xs font-mono font-bold text-gray-400 uppercase tracking-wider">Current Status</p>
              <h2 className="text-sm font-bold text-gray-800">
                {todo.completed ? 'Completed Task' : 'Active / Pending Task'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-3xs text-gray-400">
            <span>Created: {new Date(todo.createdAt).toLocaleString()}</span>
            <span className="text-gray-300">•</span>
            <span>Updated: {new Date(todo.updatedAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Edit Form OR Task Details Showcard */}
        {editMode ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5" id="editing-panel">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Edit Mode</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-2xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="edit-title">
                  Title *
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="edit-desc">
                  Description
                </label>
                <textarea
                  id="edit-desc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="edit-priority">
                    Priority
                  </label>
                  <select
                    id="edit-priority"
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="edit-category">
                    Category
                  </label>
                  <select
                    id="edit-category"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Home">Home</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="edit-due">
                    Due Date
                  </label>
                  <input
                    id="edit-due"
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveEdits}
                className="inline-flex items-center gap-1.5 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow-xs cursor-pointer"
                id="save-edits-button"
              >
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Box (Details) */}
            <div className="md:col-span-2 space-y-6">
              {/* Main Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold border capitalize ${priorityColors[todo.priority]}`}>
                      Priority: {todo.priority}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold border text-indigo-700 bg-indigo-50 border-indigo-150">
                      <Tag className="h-3 w-3" /> {todo.category}
                    </span>
                    {todo.dueDate && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold border text-amber-700 bg-amber-50 border-amber-150">
                        <Calendar className="h-3 w-3" /> Due {new Date(todo.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 pt-1 leading-snug">{todo.title}</h1>
                </div>

                {todo.description ? (
                  <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-150">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{todo.description}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No description provided.</p>
                )}
              </div>

              {/* Rich Notes Panel */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <FileText className="h-4.5 w-4.5 text-indigo-600" />
                  Additional Notes & Documentation
                </h3>
                {editMode ? null : (
                  <div className="space-y-3">
                    <textarea
                      placeholder="Write markdown details, links, or thoughts regarding this task here. Updates will save automatically..."
                      value={editNotes}
                      onChange={(e) => {
                        setEditNotes(e.target.value);
                      }}
                      onBlur={() => handleUpdate({ notes: editNotes })}
                      rows={6}
                      className="w-full px-3.5 py-3 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-gray-50/30"
                    />
                    <p className="text-4xs font-mono text-gray-400 text-right uppercase">Focus out of text area to auto-save notes.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Box (Subtask Checklist Manager) */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <ListTodo className="h-4.5 w-4.5 text-indigo-600" />
                  Action Checklist
                </h3>

                {/* Checklist subtasks builder */}
                <form onSubmit={handleAddSubtask} className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Add step..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition duration-150 cursor-pointer shadow-xs"
                    title="Add action item"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </form>

                {/* Subtasks render */}
                {todo.subtasks.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4 italic">No action items added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {todo.subtasks.map((st) => (
                      <div
                        key={st.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition duration-150 ${
                          st.completed
                            ? 'bg-emerald-50/30 border-emerald-100 text-gray-400'
                            : 'bg-gray-50/50 border-gray-200 text-gray-700'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleSubtask(st.id)}
                            className="mt-0.5 shrink-0 focus:outline-hidden cursor-pointer"
                          >
                            {st.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-300 hover:text-indigo-600" />
                            )}
                          </button>
                          <span className={`truncate ${st.completed ? 'line-through' : ''}`}>
                            {st.title}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteSubtask(st.id)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition"
                          title="Delete step"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
