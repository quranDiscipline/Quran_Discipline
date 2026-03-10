import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBookingStore } from '../store/booking.store';

export type BookingStep = 1 | 2 | 3 | 4;

const STEP_PARAM_KEY = 'step';

/**
 * Hook to manage booking step state via URL params.
 * Syncs with the booking store and updates URL on step changes.
 */
export const useBookingStep = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const store = useBookingStore();
  const { isConfirmed } = store;

  // Use a ref to track the last synced step to avoid infinite loops
  const lastSyncedStepRef = useRef<number | null>(null);

  // Get step from URL or default to 1
  const urlStep = searchParams.get(STEP_PARAM_KEY);
  const stepFromUrl: BookingStep = urlStep ? (parseInt(urlStep) as BookingStep) : 1;

  // Sync store with URL on mount and when URL changes
  useEffect(() => {
    if (isConfirmed) {
      // Don't update if we're on success screen
      return;
    }
    // Only sync if the step actually changed to avoid infinite loops
    if (stepFromUrl <= 3 && stepFromUrl !== lastSyncedStepRef.current) {
      lastSyncedStepRef.current = stepFromUrl;
      store.goToStep(stepFromUrl as 1 | 2 | 3);
    }
  }, [stepFromUrl, isConfirmed, store]);

  // Update URL when step changes
  const setStep = (newStep: BookingStep) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (newStep === 1) {
        newParams.delete(STEP_PARAM_KEY);
      } else {
        newParams.set(STEP_PARAM_KEY, newStep.toString());
      }
      return newParams;
    });
    // Only update store for steps 1-3
    if (newStep <= 3) {
      store.goToStep(newStep as 1 | 2 | 3);
    }
  };

  // Reset booking state and URL
  const handleReset = () => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete(STEP_PARAM_KEY);
      return newParams;
    });
    lastSyncedStepRef.current = 1;
    store.reset();
  };

  return {
    step: isConfirmed ? 4 : stepFromUrl,
    setStep,
    reset: handleReset,
    isConfirmed,
  };
};
