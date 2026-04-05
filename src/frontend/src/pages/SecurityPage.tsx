import { AlertTriangle, Check, Copy, Eye, QrCode, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

interface SecurityPageProps {
  onNavigate: (page: Page) => void;
}

const OFFICIAL_URL = "https://capsulevault-1ie.caffeine.xyz/";

export function SecurityPage({ onNavigate: _onNavigate }: SecurityPageProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(OFFICIAL_URL);
      setCopiedUrl(true);
      toast.success("Official URL copied!");
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (_error) {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Security & Verification
        </h1>
        <p className="text-muted-foreground text-lg">
          How to verify you're using the official LockLetter site
        </p>
      </div>

      <div className="space-y-6">
        {/* Official Domain */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Official Domain
            </CardTitle>
            <CardDescription>
              Always verify you're on the correct website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Official LockLetter URL:
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="flex-1 font-mono text-sm bg-background px-3 py-2 rounded border">
                  {OFFICIAL_URL}
                </code>
                <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                  {copiedUrl ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm">Beware of Impersonators</p>
                <p className="text-sm text-muted-foreground">
                  If the URL in your browser doesn't match exactly, you may be
                  on a fake site. Close the tab immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              Official QR Code
            </CardTitle>
            <CardDescription>
              Scan this code to visit the official site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-lg border-2 border-primary/20">
                <img
                  src="/assets/generated/qr-code-official-site.dim_200x200.png"
                  alt="Official LockLetter QR Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                This QR code links to:{" "}
                <code className="text-xs">{OFFICIAL_URL}</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Verification Stamps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Verification Stamps
            </CardTitle>
            <CardDescription>
              Look for these indicators on capsules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Verified Badge</p>
                  <p className="text-sm text-muted-foreground">
                    Capsules created on the official site display a "Verified by
                    LockLetter" badge with an integrity hash.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">
                    Commit ID (Predictions)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Prediction capsules include a Commit ID that proves the
                    prediction wasn't changed after creation.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Safety Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Always check the URL before entering claim codes</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Bookmark the official site to avoid typos</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>
                  Never share your claim codes on public forums or social media
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>
                  If something feels suspicious, verify the domain first
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
