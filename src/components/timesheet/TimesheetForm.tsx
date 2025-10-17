import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Clock } from "lucide-react";
import Modal from "../common/Modal";

interface TimesheetEntry {
  id?: number;
  date: string;
  project: string;
  task: string;
  hours: number;
  description: string;
}

interface TimesheetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: TimesheetEntry) => void;
  entry?: TimesheetEntry | null;
}

export default function TimesheetForm({ isOpen, onClose, onSubmit, entry }: TimesheetFormProps) {
  const [formData, setFormData] = useState<TimesheetEntry>({
    date: new Date().toISOString().split('T')[0],
    project: '',
    task: '',
    hours: 0,
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (entry) {
      setFormData({
        date: entry.date || new Date().toISOString().split('T')[0],
        project: entry.project || '',
        task: entry.task || '',
        hours: entry.hours || 0,
        description: entry.description || ''
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        project: '',
        task: '',
        hours: 0,
        description: ''
      });
    }
    setErrors({});
  }, [entry, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.hours || formData.hours <= 0) newErrors.hours = 'Hours must be greater than 0';
    if (formData.hours > 24) newErrors.hours = 'Hours cannot exceed 24 per day';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const quickHourButtons = [0.5, 1, 2, 4, 6, 8];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={entry ? 'Edit Timesheet Entry' : 'Add Timesheet Entry'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project
            </label>
            <input
              type="text"
              value={formData.project}
              onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task
            </label>
            <input
              type="text"
              value={formData.task}
              onChange={(e) => setFormData(prev => ({ ...prev, task: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Task description"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hours *
          </label>
          <div className="space-y-3">
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={formData.hours}
              onChange={(e) => setFormData(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.hours ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter hours"
            />
            {errors.hours && <p className="text-sm text-red-600">{errors.hours}</p>}

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Quick select:</span>
              {quickHourButtons.map(hour => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, hours: hour }))}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-md transition-colors"
                >
                  {hour}h
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Describe what you worked on..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            {entry ? 'Update Entry' : 'Add Entry'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
