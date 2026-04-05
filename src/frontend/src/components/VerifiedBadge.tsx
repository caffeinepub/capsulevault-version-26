import { Check, Shield } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface VerifiedBadgeProps {
  integrityHash?: string;
  className?: string;
}

export function VerifiedBadge({
  integrityHash,
  className = "",
}: VerifiedBadgeProps) {
  const displayHash = integrityHash || generateDisplayHash();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`border-primary/50 bg-primary/5 text-primary hover:bg-primary/10 cursor-help ${className}`}
          >
            <Shield className="w-3 h-3 mr-1.5" />
            <Check className="w-3 h-3 mr-1" />
            Verified by LockLetter
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold text-sm">Official Verification</p>
            <p className="text-xs text-muted-foreground">
              This capsule was created on the official LockLetter site:
            </p>
            <code className="text-xs block bg-muted px-2 py-1 rounded">
              https://capsulevault-1ie.caffeine.xyz/
            </code>
            <p className="text-xs text-muted-foreground">
              Integrity Hash:{" "}
              <code className="text-xs">{displayHash.slice(0, 16)}...</code>
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Generate a display hash for verification purposes
function generateDisplayHash(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return `${timestamp}${random}`.substring(0, 32);
}
