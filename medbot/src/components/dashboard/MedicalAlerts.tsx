import * as React from "react";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AlertItem {
  id: string;
  message: string;
  type: "warning" | "error" | "info";
}

export function MedicalAlerts() {
  const [alerts, setAlerts] = React.useState<AlertItem[]>([
    { id: "1", message: "Glucose level elevated - 230 mg/dL", type: "warning" },
  ]);

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`flex items-center justify-between rounded-xl p-4 shadow-sm ${
              alert.type === "warning" ? "bg-amber-100 text-amber-900 border border-amber-200" :
              alert.type === "error" ? "bg-red-100 text-red-900 border border-red-200" :
              "bg-blue-100 text-blue-900 border border-blue-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium text-sm">{alert.message}</span>
            </div>
            <button onClick={() => removeAlert(alert.id)} className="opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
