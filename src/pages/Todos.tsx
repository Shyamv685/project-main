import { useState } from "react";
import { Plus, Check, X, Edit2 } from "lucide-react";

interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

export default function Todos() {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: 1,
      title: "Review employee leave requests",
      description: "Check and approve pending leave applications",
      completed: false,
      priority: 'high',
      dueDate: "2025-10-18"
    },
    {
      id: 2,
      title: "Schedule team meeting",
      description: "Organize monthly team sync meeting",
      completed: true,
      priority: 'medium',
      dueDate: "2025-10-16"
    },
    {
      id: 3,
      title: "Update employee handbook",
      description: "Review and update company policies",
      completed: false,
      priority: 'low',
      dueDate: "2025-10-25"
    }
  ]);

  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: ''
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const addTodo = () => {
    if (!newTodo.title.trim()) return;

    const todo: Todo = {
      id: Date.now(),
      title: newTodo.title,
      description: newTodo.description,
      completed: false,
      priority: newTodo.priority,
      dueDate: newTodo.dueDate
    };

    setTodos([...todos, todo]);
    setNewTodo({ title: '', description: '', priority: 'medium', dueDate: '' });
    setShowAddForm(false);
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const pendingTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Todos</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your tasks and priorities</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Todo
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Todo</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter todo title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={newTodo.description}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Enter todo description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTodo.dueDate}
                  onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addTodo}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Todo
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Pending Tasks ({pendingTodos.length})
          </h2>
          <div className="space-y-3">
            {pendingTodos.map((todo) => (
              <div key={todo.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center mt-0.5"
                    >
                      {todo.completed && <Check className="w-3 h-3 text-green-600" />}
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {todo.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {todo.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                          {todo.priority}
                        </span>
                        {todo.dueDate && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Due: {new Date(todo.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {completedTodos.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Completed Tasks ({completedTodos.length})
            </h2>
            <div className="space-y-3">
              {completedTodos.map((todo) => (
                <div key={todo.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className="w-5 h-5 border-2 border-green-600 rounded flex items-center justify-center mt-0.5"
                      >
                        <Check className="w-3 h-3 text-green-600" />
                      </button>
                      <div className="flex-1">
                        <h3 className="font-medium line-through text-gray-500">
                          {todo.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {todo.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
