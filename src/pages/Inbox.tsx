import { useState } from "react";
import { Mail, Search, Filter } from "lucide-react";

export default function Inbox() {
  const [messages] = useState([
    {
      id: 1,
      from: "John Doe",
      subject: "Leave Request",
      message: "I would like to request 2 days of leave...",
      date: "2025-10-16",
      read: false
    },
    {
      id: 2,
      from: "Jane Smith",
      subject: "Attendance Issue",
      message: "There seems to be an error in my attendance record...",
      date: "2025-10-15",
      read: true
    }
  ]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inbox</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your messages and notifications</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {messages.map((message) => (
            <div key={message.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!message.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Mail className={`w-5 h-5 mt-1 ${!message.read ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">{message.from}</span>
                      {!message.read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <h3 className={`font-medium ${!message.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {message.subject}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {message.message}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{message.date}</span>
              </div>
            </div>
          ))}
        </div>

        {messages.length === 0 && (
          <div className="p-8 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No messages</h3>
            <p className="text-gray-600 dark:text-gray-400">Your inbox is empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
