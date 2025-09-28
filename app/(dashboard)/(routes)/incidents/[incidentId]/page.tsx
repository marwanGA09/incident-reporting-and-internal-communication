'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/hooks/use-notification-store';
import { markNotificationsAsRead } from '@/app/lib/actions';
import IncidentDetail from '../_components/IncidentDetail';

export default function IncidentPage({ params }: { params: { incidentId: string } }) {
  const { markAsRead } = useNotificationStore();

  useEffect(() => {
    const url = `/incidents/${params.incidentId}`;
    markNotificationsAsRead(url);
    markAsRead(url);
  }, [params.incidentId, markAsRead]);

  return <IncidentDetail incidentId={params.incidentId} />;
}
