import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from './useReducedMotion';

describe('useReducedMotion', () => {
  let matchMediaMock: {
    matches: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Mock window.matchMedia
    matchMediaMock = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) => matchMediaMock as unknown as MediaQueryList,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when prefers-reduced-motion is not set', () => {
    matchMediaMock.matches = false;

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });

  it('returns true when prefers-reduced-motion is set', () => {
    matchMediaMock.matches = true;

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);
  });

  it('registers change event listener on mount', () => {
    renderHook(() => useReducedMotion());

    expect(matchMediaMock.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });

  it('removes change event listener on unmount', () => {
    const { unmount } = renderHook(() => useReducedMotion());

    unmount();

    expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });

  it('updates value when media query changes', () => {
    matchMediaMock.matches = false;

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);

    // Get the change listener callback
    const changeCallback = (matchMediaMock.addEventListener as ReturnType<typeof vi.fn>).mock.calls[0][1];

    // Simulate media query change
    act(() => {
      changeCallback({ matches: true });
    });

    expect(result.current).toBe(true);
  });

  it('updates to false when media query changes from true to false', () => {
    matchMediaMock.matches = true;

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);

    // Get the change listener callback
    const changeCallback = (matchMediaMock.addEventListener as ReturnType<typeof vi.fn>).mock.calls[0][1];

    // Simulate media query change
    act(() => {
      changeCallback({ matches: false });
    });

    expect(result.current).toBe(false);
  });
});
