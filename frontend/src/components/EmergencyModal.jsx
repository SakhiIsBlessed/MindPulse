import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

const EmergencyModal = ({ isOpen, onClose, onConfirm, loading }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-red-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-50 p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-700">Serious Wellness Alert Detected</h2>
              <p className="mt-2 text-red-600 font-medium">
                We have noticed sustained indicators of emotional distress.
              </p>
            </div>

            <div className="p-8">
              <p className="text-gray-600 leading-relaxed text-center">
                Would you like us to notify your emergency contact? We will share your recent wellness report to help them understand how to support you best.
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                  Notify Contact
                </button>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              <p className="mt-6 text-[11px] text-gray-400 text-center italic">
                This notification is intended to promote care, safety, and timely support. No diagnostic language is used in the communication.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmergencyModal;
