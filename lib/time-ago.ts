// lib/time-ago.ts

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 10) return "last seen just now";
  if (minutes < 60) return `last seen ${minutes} minutes ago`;
  if (hours < 24) return `last seen ${hours} hours ago`;
  if (days === 1) return `last seen yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  
  return `last seen on ${date.toLocaleDateString()}`;
}
