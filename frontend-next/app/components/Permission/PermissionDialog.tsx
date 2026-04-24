"use client";
import React from 'react';
import { Bell, MapPin, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type PermissionType = 'notification' | 'location' | 'camera';

interface PermissionDialogProps {
  isOpen: boolean;
  type: PermissionType | null;
  onAllow: () => void;
  onDeny: () => void;
}

export const PermissionDialog: React.FC<PermissionDialogProps> = ({ isOpen, type, onAllow, onDeny }) => {
  if (!type) return null;

  const contentMap = {
    notification: {
      title: "Get order updates & best deals instantly 🔔",
      description: "Allow notifications to receive real-time alerts on your orders and exclusive offers.",
      icon: <Bell size={40} className="text-white" />,
      color: "bg-[#2874F0]"
    },
    location: {
      title: "Allow location to auto-detect your delivery address 📍",
      description: "Find your delivery address quickly to speed up your checkout process.",
      icon: <MapPin size={40} className="text-white" />,
      color: "bg-[#F9C74F]"
    },
    camera: {
      title: "Upload photo for better experience 📸",
      description: "We need access to your camera and gallery to upload photos.",
      icon: <Camera size={40} className="text-white" />,
      color: "bg-green-500"
    }
  };

  const current = contentMap[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[99999]"
            onClick={onDeny}
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            className="fixed bottom-0 left-0 right-0 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 w-full md:w-[400px] bg-white rounded-t-3xl md:rounded-3xl p-6 z-[999999] shadow-2xl flex flex-col items-center text-center"
          >
            <button 
              onClick={onDeny} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className={`w-20 h-20 rounded-full ${current.color} flex items-center justify-center mb-5 shadow-lg shadow-black/10`}>
              {current.icon}
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
              {current.title}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {current.description}
            </p>
            
            <div className="w-full flex justify-between gap-3">
              <button 
                onClick={onDeny}
                className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Not Now
              </button>
              <button 
                onClick={onAllow}
                className={`flex-1 py-3.5 rounded-xl font-bold text-white shadow-md hover:opacity-90 transition-opacity ${current.color}`}
              >
                Continue
              </button>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
