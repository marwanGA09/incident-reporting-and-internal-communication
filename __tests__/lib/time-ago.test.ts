import { formatTimeAgo } from '../../lib/time-ago';

describe('formatTimeAgo', () => {
  beforeEach(() => {
    // Mock the current date for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 0, 1, 12, 0, 0)); // Jan 1, 2023, 12:00:00
  });

  afterEach(() => {
    // Restore the real timers after each test
    jest.useRealTimers();
  });

  it('should return "last seen just now" for times less than 10 seconds ago', () => {
    const date = new Date(2023, 0, 1, 11, 59, 55); // 5 seconds ago
    expect(formatTimeAgo(date)).toBe('last seen just now');
  });

  it('should return minutes ago for times within an hour', () => {
    const date = new Date(2023, 0, 1, 11, 55, 0); // 5 minutes ago
    expect(formatTimeAgo(date)).toBe('last seen 5 minutes ago');
    
    const date2 = new Date(2023, 0, 1, 11, 30, 0); // 30 minutes ago
    expect(formatTimeAgo(date2)).toBe('last seen 30 minutes ago');
  });

  it('should return hours ago for times within a day', () => {
    const date = new Date(2023, 0, 1, 10, 0, 0); // 2 hours ago
    expect(formatTimeAgo(date)).toBe('last seen 2 hours ago');
    
    const date2 = new Date(2023, 0, 1, 6, 0, 0); // 6 hours ago
    expect(formatTimeAgo(date2)).toBe('last seen 6 hours ago');
  });

  it('should return yesterday for times exactly one day ago', () => {
    const date = new Date(2022, 11, 31, 10, 30, 0); // Yesterday at 10:30 AM
    expect(formatTimeAgo(date)).toBe('last seen yesterday at 10:30 AM');
  });

  it('should return a formatted date for times more than one day ago', () => {
    const date = new Date(2022, 11, 25, 14, 30, 0); // More than a day ago
    expect(formatTimeAgo(date)).toBe('last seen on 12/25/2022');
  });

  it('should handle times across different days correctly', () => {
    const date = new Date(2022, 11, 20); // 12 days ago
    expect(formatTimeAgo(date)).toBe('last seen on 12/20/2022');
  });
});