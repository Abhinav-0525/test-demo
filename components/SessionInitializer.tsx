'use client';

import { useEffect } from 'react';
import { sessionManager } from '@/lib/sessionManager';

export default function SessionInitializer() {
  useEffect(() => {
    // Initialize session manager on mount
    sessionManager.initialize();

    // Clean up on unmount
    return () => {
      sessionManager.endSession();
    };
  }, []);

  return null;
}