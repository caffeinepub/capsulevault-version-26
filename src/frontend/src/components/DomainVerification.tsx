import { useEffect, useState } from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

const OFFICIAL_DOMAIN = 'capsulevault-1ie.caffeine.xyz';
const ALLOWED_DOMAINS = [
  'capsulevault-1ie.caffeine.xyz',
  'localhost',
  '127.0.0.1'
];

export function DomainVerification() {
  const [showWarning, setShowWarning] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    
    // Check if domain is allowed
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.caffeine.ai')
    );

    if (!isAllowed && !redirectAttempted) {
      // Attempt auto-redirect
      setRedirectAttempted(true);
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      const officialUrl = `https://${OFFICIAL_DOMAIN}${currentPath}`;
      
      try {
        window.location.replace(officialUrl);
      } catch (error) {
        // Redirect failed, show warning
        setShowWarning(true);
      }
      
      // Fallback: show warning after short delay if redirect didn't work
      setTimeout(() => {
        setShowWarning(true);
      }, 1000);
    }
  }, [redirectAttempted]);

  if (!showWarning) {
    return null;
  }

  const handleGoToOfficial = () => {
    const currentPath = window.location.pathname + window.location.search + window.location.hash;
    window.location.href = `https://${OFFICIAL_DOMAIN}${currentPath}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-card border-2 border-destructive rounded-lg shadow-2xl">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-destructive mb-1">Security Warning</h1>
              <p className="text-sm text-muted-foreground">Unauthorized domain detected</p>
            </div>
          </div>

          <div className="space-y-4 text-base">
            <p className="font-semibold">
              This is NOT the official CapsuleVault site.
            </p>
            <p>
              Only use CapsuleVault at:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <code className="text-lg font-mono font-bold text-primary break-all">
                https://{OFFICIAL_DOMAIN}/
              </code>
            </div>
            <p className="text-destructive font-medium">
              If you are on any other address, it may be impersonating the real app.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleGoToOfficial}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Go to Official Site
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              For your security, do not create or open capsules on this site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
