import React from 'react';
import { CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { Todo } from '../types';

interface StatsCardProps {
  todos: Todo[];
}

export const StatsCard: React.FC<StatsCardProps> = ({ todos }) => {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const pending = total - completed;
  const highPriority = todos.filter((t) => !t.completed && t.priority === 'high').length;

  const stats = [
    {
      id: 'stat-total',
      label: 'Total Tasks',
      value: total,
      icon: ListTodo,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      id: 'stat-completed',
      label: 'Completed',
      value: completed,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      id: 'stat-pending',
      label: 'Pending',
      value: pending,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      id: 'stat-high',
      label: 'High Priority',
      value: highPriority,
      icon: AlertCircle,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-stats-grid">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            id={stat.id}
            className={`flex items-center p-4 rounded-xl border bg-white shadow-xs transition-all duration-200`}
          >
            <div className={`p-3 rounded-lg mr-4 ${stat.color.split(' ')[1]} ${stat.color.split(' ')[0]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};
