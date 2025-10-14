import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  isVisible: boolean;
}

export default function Alert({ type, message, isVisible }: AlertProps) {
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      textColor: "text-green-800",
      iconColor: "text-green-500"
    },
    error: {
      icon: XCircle,
      bgColor: "bg-red-50",
      textColor: "text-red-800",
      iconColor: "text-red-500"
    },
    warning: {
      icon: AlertCircle,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-800",
      iconColor: "text-yellow-500"
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
      iconColor: "text-blue-500"
    }
  };

  const { icon: Icon, bgColor, textColor, iconColor } = config[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`${bgColor} ${textColor} p-4 rounded-lg flex items-center gap-3 mb-4`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <p>{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
