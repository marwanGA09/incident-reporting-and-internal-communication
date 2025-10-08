import { getBadgeVariantForStatus } from '../../lib/getBadgeVariantForStatus';

describe('getBadgeVariantForStatus', () => {
  it('should return "reported" for REPORTED status', () => {
    expect(getBadgeVariantForStatus('REPORTED')).toBe('reported');
  });

  it('should return "inReview" for IN_REVIEW status', () => {
    expect(getBadgeVariantForStatus('IN_REVIEW')).toBe('inReview');
  });

  it('should return "resolved" for RESOLVED status', () => {
    expect(getBadgeVariantForStatus('RESOLVED')).toBe('resolved');
  });

  it('should return "closed" for CLOSED status', () => {
    expect(getBadgeVariantForStatus('CLOSED')).toBe('closed');
  });

  it('should return "default" for unknown status', () => {
    expect(getBadgeVariantForStatus('UNKNOWN')).toBe('default');
    expect(getBadgeVariantForStatus('')).toBe('default');
    expect(getBadgeVariantForStatus('random')).toBe('default');
  });

  it('should handle case-sensitive status values', () => {
    expect(getBadgeVariantForStatus('reported')).toBe('default'); // lowercase
    expect(getBadgeVariantForStatus('Reported')).toBe('default'); // capitalized
  });
});