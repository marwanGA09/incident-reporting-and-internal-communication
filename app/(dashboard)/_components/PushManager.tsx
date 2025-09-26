'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// VAPID keys should be stored in environment variables
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setIsSubscribed(true);
          }
          setIsLoading(false);
        });
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const subscribeUser = async () => {
    if (!VAPID_PUBLIC_KEY) {
      toast.error('Push notifications are not configured by the server.');
      console.error('VAPID public key is not configured.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        body: JSON.stringify(sub),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription on the server.');
      }

      setIsSubscribed(true);
      toast.success('Push notifications enabled!');
    } catch (error) {
      console.error('Failed to subscribe user: ', error);
      toast.error('Failed to enable push notifications.');
    }
  };

  if (isLoading) {
    return null; // Don't render anything while checking subscription status
  }

  if (isSubscribed) {
    return (
      <p className="p-2 text-xs text-center text-green-600">
        Push notifications are enabled on this device.
      </p>
    );
  }

  return (
    <div className="p-2">
      <Button onClick={subscribeUser} size="sm" className="w-full">
        Enable Push Notifications
      </Button>
    </div>
  );
}
