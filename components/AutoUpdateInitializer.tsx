'use client';

import { useEffect } from 'react';
import { initializeStigAutoUpdate } from '../utils/stigAutoUpdateInit';

export default function AutoUpdateInitializer() {
  useEffect(() => {
    // Initialize the STIG auto-update system when the app loads
    initializeStigAutoUpdate();
    
    // Cleanup function (though not really needed for this use case)
    return () => {
      // Could add cleanup logic here if needed
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}