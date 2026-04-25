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
        if (Capacitor.isNativePlatform()) {
          const result = await PushNotifications.requestPermissions();
          if (result.receive === 'granted') {
            await PushNotifications.register();
            return true;
          }
          return false;
        } else {
          if (typeof window !== 'undefined' && 'Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
          }
          return false;
        }
      }
      
      if (type === 'location') {
        if (Capacitor.isNativePlatform()) {
          const result = await Geolocation.requestPermissions({ permissions: ['location'] });
          return result.location === 'granted' || result.coarseLocation === 'granted';
        } else {
          return new Promise((resolve) => {
            if (typeof window !== 'undefined' && 'geolocation' in navigator) {
              navigator.geolocation.getCurrentPosition(
                () => resolve(true),
                () => resolve(false)
              );
            } else {
              resolve(false);
            }
          });
        }
      }
      
      if (type === 'camera') {
        if (Capacitor.isNativePlatform()) {
          const result = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
          return result.camera === 'granted' || result.photos === 'granted';
        } else {
          if (typeof window !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
              stream.getTracks().forEach(track => track.stop());
              return true;
            } catch (e) {
              return false;
            }
          }
          return false;
        }
      }
    } catch (err) {
      console.error(`Error requesting permission for ${type}`, err);
    }
    return false;
  };

  const requestSmartPermission = useCallback(async (type: PermissionType): Promise<boolean> => {
    // 1. Check strict Permission Status First
    try {
      if (type === 'notification') {
        if (Capacitor.isNativePlatform()) {
          const status = await PushNotifications.checkPermissions();
          if (status.receive === 'granted') return true;
          if (status.receive === 'denied') return false; 
        } else {
          if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') return true;
            if (Notification.permission === 'denied') return false;
          }
        }
      } else if (type === 'location') {
        if (Capacitor.isNativePlatform()) {
          const status = await Geolocation.checkPermissions();
          if (status.location === 'granted' || status.coarseLocation === 'granted') return true;
        } else {
          if (typeof window !== 'undefined' && navigator.permissions) {
             const status = await navigator.permissions.query({ name: 'geolocation' });
             if (status.state === 'granted') return true;
             if (status.state === 'denied') return false;
          }
        }
      } else if (type === 'camera') {
        if (Capacitor.isNativePlatform()) {
          const status = await Camera.checkPermissions();
          if (status.camera === 'granted' && status.photos === 'granted') return true;
        } else {
          if (typeof window !== 'undefined' && navigator.permissions) {
             try {
                const status = await navigator.permissions.query({ name: 'camera' as PermissionName });
                if (status.state === 'granted') return true;
                if (status.state === 'denied') return false;
             } catch(e) {
                 // Ignore if not supported
             }
          }
        }
      }
    } catch (e) {
      console.warn("Could not check permissions: ", e);
    }

    // 2. User localstorage dismissal lock (24 hr cooldown)
    const lastDismissed = localStorage.getItem(`perm_dismissed_${type}`);
    if (lastDismissed) {
      const timeSince = Date.now() - parseInt(lastDismissed, 10);
      if (timeSince < 24 * 60 * 60 * 1000) {
        return false; 
      } else {
        localStorage.removeItem(`perm_dismissed_${type}`);
      }
    }

    // 3. Show the Soft Popup
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
