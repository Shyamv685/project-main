import { motion } from "framer-motion";

export default function Announcements() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Announcements</h1>
        <p className="text-gray-600 dark:text-gray-300">Stay updated with the latest company announcements.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-500 dark:text-gray-400">Announcements functionality coming soon...</p>
      </div>
    </motion.div>
  );
}
