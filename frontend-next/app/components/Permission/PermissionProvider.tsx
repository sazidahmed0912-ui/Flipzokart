"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PermissionDialog, PermissionType } from './PermissionDialog';
import { PushNotifications } from '@capacitor/push-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/app/components/toast';

interface PermissionContextType {
  requestSmartPermission: (type: PermissionType) => Promise<boolean>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: PermissionType | null;
    resolve: ((granted: boolean) => void) | null;
  }>({
    isOpen: false,
    type: null,
    resolve: null
  });

  const { addToast } = useToast();

  const handleNativePermissionRequest = async (type: PermissionType): Promise<boolean> => {
    try {
      if (type === 'notification') {
        const result = await PushNotifications.requestPermissions();
        if (result.receive === 'granted') {
          await PushNotifications.register();
          return true;
        }
        return false;
      }
      
      if (type === 'location') {
        const result = await Geolocation.requestPermissions({ permissions: ['location'] });
        return result.location === 'granted' || result.coarseLocation === 'granted';
      }
      
      if (type === 'camera') {
        const result = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
        return result.camera === 'granted' || result.photos === 'granted';
      }
    } catch (err) {
      console.error(`Error requesting natively for ${type}`, err);
    }
    return false;
  };

  const requestSmartPermission = useCallback(async (type: PermissionType): Promise<boolean> => {
    // 1. If not native, bypass (for web fallback)
    if (!Capacitor.isNativePlatform()) {
      return true;
    }

    // 2. Check strict Native Permission Status First
    try {
      if (type === 'notification') {
        const status = await PushNotifications.checkPermissions();
        if (status.receive === 'granted') return true;
        if (status.receive === 'denied') return false; // Already explicitly denied OS-level
      } else if (type === 'location') {
        const status = await Geolocation.checkPermissions();
        if (status.location === 'granted' || status.coarseLocation === 'granted') return true;
      } else if (type === 'camera') {
        const status = await Camera.checkPermissions();
        if (status.camera === 'granted' && status.photos === 'granted') return true;
      }
    } catch (e) {
      console.warn("Could not check permissions: ", e);
    }

    // 3. User localstorage dismissal lock (24 hr cooldown)
    const lastDismissed = localStorage.getItem(`perm_dismissed_${type}`);
    if (lastDismissed) {
      const timeSince = Date.now() - parseInt(lastDismissed, 10);
      if (timeSince < 24 * 60 * 60 * 1000) {
        return false; 
      } else {
        localStorage.removeItem(`perm_dismissed_${type}`);
      }
    }

    // 4. Show the Soft Popup
    return new Promise<boolean>((resolve) => {
      setModalState({
        isOpen: true,
        type,
        resolve
      });
    });
  }, []);

  const handleAllow = async () => {
    const { type, resolve } = modalState;
    if (!type || !resolve) return;
    
    // Close the soft popup
    setModalState({ isOpen: false, type: null, resolve: null });
    
    // Trigger Native Prompt
    const granted = await handleNativePermissionRequest(type);
    
    if (!granted) {
      // Trust Building - they denied natively
      addToast('info', "Permission denied? No problem 😊 You can still continue manually.");
      localStorage.setItem(`perm_dismissed_${type}`, Date.now().toString());
    }
    
    resolve(granted);
  };

  const handleDeny = () => {
    const { type, resolve } = modalState;
    if (!type || !resolve) return;
    
    setModalState({ isOpen: false, type: null, resolve: null });
    
    // Register Soft Dismissal
    localStorage.setItem(`perm_dismissed_${type}`, Date.now().toString());
    resolve(false);
  };

  return (
    <PermissionContext.Provider value={{ requestSmartPermission }}>
      {children}
      <PermissionDialog 
        isOpen={modalState.isOpen} 
        type={modalState.type} 
        onAllow={handleAllow} 
        onDeny={handleDeny} 
      />
    </PermissionContext.Provider>
  );
};

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};
