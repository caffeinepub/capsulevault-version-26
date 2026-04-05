import { Check, Copy, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

const OFFICIAL_URL = "https://capsulevault-1ie.caffeine.xyz/";

export function OfficialLinkBanner() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(OFFICIAL_URL);
      setCopied(true);
      toast.success("Official link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="bg-primary/5 border-y border-primary/20">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground">
              Official LockLetter link:
            </span>
          </div>
          <code className="font-mono font-semibold text-primary break-all text-center sm:text-left">
            {OFFICIAL_URL}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1.5" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
