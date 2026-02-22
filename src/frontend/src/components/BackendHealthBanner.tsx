import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface BackendHealthBannerProps {
  isHealthy: boolean;
  isLoading: boolean;
}

export function BackendHealthBanner({ isHealthy, isLoading }: BackendHealthBannerProps) {
  if (isLoading || isHealthy) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Storage temporarily offline. Please try again shortly.
      </AlertDescription>
    </Alert>
  );
}
