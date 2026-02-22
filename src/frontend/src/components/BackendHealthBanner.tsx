import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { useEffect } from 'react';

interface BackendHealthBannerProps {
  isHealthy: boolean | undefined;
  isLoading: boolean;
}

export function BackendHealthBanner({ isHealthy, isLoading }: BackendHealthBannerProps) {
  useEffect(() => {
    console.log('[DIAGNOSTIC] BackendHealthBanner state:', {
      isHealthy,
      isLoading,
      shouldShowBanner: !isLoading && isHealthy === false
    });
  }, [isHealthy, isLoading]);

  // Only show banner if:
  // 1. Not loading (health check has completed)
  // 2. Health check explicitly returned false (not undefined)
  if (isLoading || isHealthy !== false) {
    return null;
  }

  console.log('[DIAGNOSTIC] Displaying storage offline banner');

  return (
    <Alert variant="destructive" className="mb-6 mx-4 mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Storage temporarily offline. Please try again shortly.
      </AlertDescription>
    </Alert>
  );
}
