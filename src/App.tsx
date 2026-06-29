import { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, ListTodo, RefreshCw } from 'lucide-react';
import { Todo, Priority } from './types';
import { StatsCard } from './components/StatsCard';
import { AddTodoForm } from './components/AddTodoForm';
import { TodoItem } from './components/TodoItem';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchTodos = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/todos');
      if (!res.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error(err);
      setError('Could not fetch todos. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // CRUD Handler: Add Todo
  const handleAddTodo = async (todoData: {
    title: string;
    description: string;
    priority: Priority;
    category: string;
    dueDate: string;
    subtasks: { title: string; completed: boolean }[];
    notes: string;
  }) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    });

    if (!res.ok) {
      throw new Error('Failed to create todo');
    }

    const newTodo = await res.json();
    setTodos((prev) => [...prev, newTodo]);
  };

  // CRUD Handler: Toggle Completed
  const handleToggleComplete = async (id: string, completed: boolean) => {
    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed, updatedAt: new Date().toISOString() } : t))
    );

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });

      if (!res.ok) {
        throw new Error('Failed to update todo');
      }
      
      const updated = await res.json();
      // Re-sync from server to be safe
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error(err);
      // Revert optimistic update on failure
      fetchTodos();
    }
  };

  // CRUD Handler: Delete Todo
  const handleDeleteTodo = async (id: string) => {
    // Optimistic UI update
    const previousTodos = [...todos];
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete todo');
      }
    } catch (err) {
      console.error(err);
      // Revert on failure
      setTodos(previousTodos);
    }
  };

  // Extract unique categories from actual todo items to populate filter dropdown
  const uniqueCategories = ['all', ...Array.from(new Set(todos.map((t) => t.category).filter(Boolean)))];

  // Helper to map priority strings to numeric values for sorting
  const priorityWeight = { high: 3, medium: 2, low: 1 };

  // Filter & Sort Logic
  const filteredTodos = todos
    .filter((todo) => {
      // 1. Search term (title and description)
      const matchesSearch =
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !todo.completed) ||
        (statusFilter === 'completed' && todo.completed);

      // 3. Priority filter
      const matchesPriority = priorityFilter === 'all' || todo.priority === priorityFilter;

      // 4. Category filter
      const matchesCategory = categoryFilter === 'all' || todo.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1; // Put null due dates at the bottom
        if (!b.dueDate) return -1;
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'priority') {
        comparison = (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" id="todo-app-root">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 py-4 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <ListTodo className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Taskspace</h1>
              <p className="text-2xs font-medium text-gray-400 font-mono tracking-wider">WORKSPACE PORTAL</p>
            </div>
          </div>

          <button
            onClick={fetchTodos}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition duration-200 cursor-pointer flex items-center gap-1 text-sm font-semibold border border-gray-200"
            title="Refresh list"
            id="refresh-button"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Statistics Banner */}
        <StatsCard todos={todos} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Create Form */}
          <div className="lg:col-span-1 space-y-6">
            <AddTodoForm onAdd={handleAddTodo} />
          </div>

          {/* Right Column: List & Filters */}
          <div className="lg:col-span-2 space-y-5" id="todos-list-view">
            {/* Filter and Control Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-4">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 bg-gray-50/50"
                  id="search-input"
                />
              </div>

              {/* Advanced multi-dimensional filtering row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status buttons */}
                  <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs font-semibold">
                    {(['all', 'active', 'completed'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-md capitalize transition duration-150 cursor-pointer ${
                          statusFilter === status
                            ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                        id={`filter-status-${status}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  {/* Priority select */}
                  <div className="relative">
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as any)}
                      className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      id="filter-priority-select"
                    >
                      <option value="all">Priority: All</option>
                      <option value="low">Priority: Low</option>
                      <option value="medium">Priority: Medium</option>
                      <option value="high">Priority: High</option>
                    </select>
                  </div>

                  {/* Category select */}
                  <div className="relative">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      id="filter-category-select"
                    >
                      <option value="all">Category: All</option>
                      {uniqueCategories
                        .filter((c) => c !== 'all')
                        .map((cat) => (
                          <option key={cat} value={cat}>
                            Category: {cat}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Sorter and Order Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-3xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <ArrowUpDown className="h-3 w-3" /> Sort by
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    id="sort-by-select"
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                  </select>
                  <button
                    onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                    className="p-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg text-gray-600 transition duration-150 cursor-pointer"
                    title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                    id="toggle-sort-order"
                  >
                    <ArrowUpDown className={`h-3.5 w-3.5 transition-transform duration-200 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-semibold" id="main-error">
                {error}
              </div>
            )}

            {/* Todo Items List */}
            {loading ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs" id="loading-spinner">
                <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
                <p className="text-sm font-medium text-gray-500">Retrieving active tasks...</p>
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs" id="empty-state">
                <div className="p-4 bg-gray-50 rounded-full border border-gray-100 text-gray-400">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mt-2">No matching tasks found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try adjusting your search criteria, selecting a different filter category, or creating a brand new task.
                </p>
                {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                      setCategoryFilter('all');
                    }}
                    className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition duration-150 cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3.5" id="active-todos-list">
                {filteredTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTodo}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Humble, clean footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-400 font-medium font-mono">
          TASKSPACE &copy; 2026. SECURE LOCAL WORKSPACE PORTAL.
        </div>
      </footer>
    </div>
  );
}
