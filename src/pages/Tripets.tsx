import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, MapPin, Calendar, Users, Car } from "lucide-react";
import { api } from "@/lib/api";
import Modal from "@/components/common/Modal";
import { useNavigate } from "react-router-dom";

interface Tripet {
  id: number;
  employeeId: number;
  destination: string;
  purpose: string;
  startDate: string;
  endDate: string;
  accommodation: string;
  transportation: string;
  status: string;
  date: string;
  employeeName?: string;
}

export default function Tripets() {
  const navigate = useNavigate();
  const [tripets, setTripets] = useState<Tripet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTripet, setEditingTripet] = useState<Tripet | null>(null);
  const [formData, setFormData] = useState({
    destination: "",
    purpose: "",
    startDate: "",
    endDate: "",
    accommodation: "",
    transportation: "",
  });

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadTripets();
  }, [user, navigate]);

  const loadTripets = async () => {
    try {
      const response = await api.getTripets();
      setTripets(response.tripets || []);
    } catch (error) {
      console.error('Failed to load tripets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTripet) {
        await api.updateTripet(editingTripet.id, formData);
      } else {
        await api.createTripet(formData);
      }
      setShowModal(false);
      setEditingTripet(null);
      resetForm();
      loadTripets();
    } catch (error) {
      console.error('Failed to save tripet:', error);
    }
  };

  const handleEdit = (tripet: Tripet) => {
    setEditingTripet(tripet);
    setFormData({
      destination: tripet.destination,
      purpose: tripet.purpose,
      startDate: tripet.startDate,
      endDate: tripet.endDate,
      accommodation: tripet.accommodation,
      transportation: tripet.transportation,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this tripet?')) {
      try {
        await api.deleteTripet(id);
        loadTripets();
      } catch (error) {
        console.error('Failed to delete tripet:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      destination: "",
      purpose: "",
      startDate: "",
      endDate: "",
      accommodation: "",
      transportation: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tripets</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your trip and travel arrangements.</p>
        </div>
        <button
          onClick={() => {
            setEditingTripet(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Tripet
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tripets.map((tripet) => (
          <motion.div
            key={tripet.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{tripet.destination}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tripet.status)}`}>
                {tripet.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>{tripet.startDate} - {tripet.endDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Users className="w-4 h-4" />
                <span>{tripet.purpose}</span>
              </div>
              {tripet.accommodation && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4" />
                  <span>{tripet.accommodation}</span>
                </div>
              )}
              {tripet.transportation && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Car className="w-4 h-4" />
                  <span>{tripet.transportation}</span>
                </div>
              )}
            </div>

            {user?.role === 'employee' && tripet.status === 'Pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(tripet)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tripet.id)}
                  className="flex-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {tripets.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tripets found</h3>
          <p className="text-gray-600 dark:text-gray-300">Create your first tripet to get started.</p>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTripet(null);
          resetForm();
        }}
        title={editingTripet ? "Edit Tripet" : "Create New Tripet"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Destination *
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Purpose *
            </label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Accommodation
            </label>
            <input
              type="text"
              value={formData.accommodation}
              onChange={(e) => setFormData({ ...formData, accommodation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Hotel name or accommodation details"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transportation
            </label>
            <input
              type="text"
              value={formData.transportation}
              onChange={(e) => setFormData({ ...formData, transportation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Flight, train, or transportation details"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingTripet ? "Update Tripet" : "Create Tripet"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingTripet(null);
                resetForm();
              }}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
