import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../../hooks/use-mobile';

// Create a mock for matchMedia
const createMatchMedia = (matches: boolean) => {
  return (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated but needed for older implementations
    removeListener: jest.fn(), // Deprecated but needed for older implementations
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  });
};

describe('useIsMobile', () => {
  const originalMatchMedia = window.matchMedia;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('should return false when screen is not mobile (width >= 768)', () => {
    window.matchMedia = createMatchMedia(false); // Not mobile media query
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Desktop size
    });

    const { result } = renderHook(() => useIsMobile());

    // Wait for useEffect to run
    act(() => {
      // Simulate the useEffect callback running
      const mql = window.matchMedia('(max-width: 767px)');
      if (mql.addEventListener) {
        // Set the mock value directly for testing
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          value: 1024,
        });
      }
    });
    
    // The hook will return !!isMobile, which would be false if isMobile was undefined initially
    // Since the hook checks window.innerWidth < 768, it should return false for 1024
    expect(result.current).toBe(false);
  });

  it('should return true when screen is mobile (width < 768)', () => {
    window.matchMedia = createMatchMedia(true); // Mobile media query
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 400, // Mobile size
    });

    const { result } = renderHook(() => useIsMobile());

    act(() => {
      // Simulate the useEffect callback running
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 400,
      });
    });
    
    expect(result.current).toBe(true);
  });

  it('should respond to window resize events', () => {
    let mockHandler: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null = null;
    
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false, // Initially not mobile
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn((event, handler) => {
        if (event === 'change') {
          mockHandler = handler;
        }
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Desktop size initially
    });

    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
    
    // Update window size to mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 400, // Mobile size
    });

    // Simulate media query change
    if (mockHandler) {
      act(() => {
        mockHandler.call(null, {} as MediaQueryListEvent);
      });
    }
    
    // After the event, it should be considered mobile
    expect(result.current).toBe(true);
  });
});