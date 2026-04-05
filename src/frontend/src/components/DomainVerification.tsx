import { AlertTriangle, ExternalLink, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const OFFICIAL_DOMAIN = "capsulevault-1ie.caffeine.xyz";
const OFFICIAL_URL = `https://${OFFICIAL_DOMAIN}/`;

export function DomainVerification() {
  const [isOfficial, setIsOfficial] = useState(true);
  const [currentDomain, setCurrentDomain] = useState("");
  const [attemptedRedirect, setAttemptedRedirect] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    setCurrentDomain(hostname);

    // Check if on official domain
    const official = hostname === OFFICIAL_DOMAIN || hostname === "localhost";
    setIsOfficial(official);

    // Attempt auto-redirect once if not on official domain
    if (!official && !attemptedRedirect && hostname !== "localhost") {
      setAttemptedRedirect(true);
      // Give user 3 seconds to see the warning before redirect
      setTimeout(() => {
        window.location.href = OFFICIAL_URL;
      }, 3000);
    }
  }, [attemptedRedirect]);

  if (isOfficial) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-4">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-destructive">
            Unauthorized Domain
          </h1>
          <p className="text-muted-foreground">
            You are not on the official LockLetter website.
          </p>
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-3 text-left">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">Current domain:</p>
              <code className="text-xs block bg-background px-2 py-1 rounded border border-destructive/20">
                {currentDomain}
              </code>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">Official domain:</p>
              <code className="text-xs block bg-background px-2 py-1 rounded border border-primary/20">
                {OFFICIAL_DOMAIN}
              </code>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Redirecting to official site in 3 seconds...
          </p>
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              window.location.href = OFFICIAL_URL;
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Go to Official LockLetter Site
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Always verify the URL before entering claim codes or creating
          capsules.
        </p>
      </div>
    </div>
  );
}
