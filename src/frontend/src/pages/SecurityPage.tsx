import { Shield, Eye, AlertTriangle, Copy, Check, QrCode } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import type { Page } from '../App';

interface SecurityPageProps {
  onNavigate: (page: Page) => void;
}

const OFFICIAL_URL = 'https://capsulevault-1ie.caffeine.xyz/';

export function SecurityPage({ onNavigate }: SecurityPageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(OFFICIAL_URL);
      setCopied(true);
      toast.success('Official link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Security</h1>
        <p className="text-muted-foreground">
          Protect yourself from fake sites and impersonation
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Official CapsuleVault Site</CardTitle>
                <CardDescription>The only legitimate URL</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              The only official URL for CapsuleVault is:
            </p>
            <div className="bg-muted p-4 rounded-lg flex items-center justify-between gap-4">
              <code className="font-mono font-bold text-primary break-all flex-1">
                {OFFICIAL_URL}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex-shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>Always check the address bar to confirm you're on the official site</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>Do not trust screenshots or forwarded links</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>Manually type or bookmark the official URL for safety</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>How to Verify</CardTitle>
                <CardDescription>Check before you create or open capsules</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-sm">1. Look at your browser's address bar</h4>
                <p className="text-sm text-muted-foreground">
                  The URL should start with exactly:
                </p>
                <code className="block mt-2 p-3 bg-muted rounded text-sm font-mono">
                  https://capsulevault-1ie.caffeine.xyz/
                </code>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-sm">2. Check for the secure connection icon</h4>
                <p className="text-sm text-muted-foreground">
                  Look for the padlock icon (🔒) in your browser's address bar, indicating a secure HTTPS connection.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-sm">3. If you see any other address</h4>
                <p className="text-sm text-muted-foreground">
                  You may be on a fake site. Close the tab immediately and navigate directly to the official URL.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Verification Stamps</CardTitle>
                <CardDescription>How to identify authentic capsules</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Legitimate capsules display a "Verified by CapsuleVault" badge when unlocked:
            </p>
            <div className="bg-background p-4 rounded-lg flex items-center justify-center">
              <img 
                src="/assets/generated/verified-badge-transparent.dim_64x64.png" 
                alt="Verified badge" 
                className="w-16 h-16"
              />
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>The badge includes the official domain and integrity verification</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>Fake sites cannot replicate authentic verification stamps</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>Use the "Verify Capsule" page to confirm authenticity</span>
              </li>
            </ul>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onNavigate({ type: 'verify' })}
            >
              Go to Capsule Verification
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <CardTitle>Stay Safe</CardTitle>
                <CardDescription>Protect your capsules from impersonation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />
                <span>Only create and open capsules on the official site</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />
                <span>Fake sites may steal your claim codes or show false content</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />
                <span><strong>CapsuleVault never unlocks capsules early</strong> and never asks for private codes</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />
                <span>When in doubt, navigate directly to the official URL</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />
                <span>Never enter your Vault Key or claim codes on suspicious sites</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Official Link Verification</CardTitle>
                <CardDescription>Easy sharing and mobile access</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan this QR code to visit the official site on your mobile device:
            </p>
            <div className="bg-white p-4 rounded-lg inline-block">
              <img 
                src="/assets/generated/qr-code-official-site.dim_200x200.png" 
                alt="QR code for official CapsuleVault site"
                className="w-48 h-48"
              />
            </div>
            <div className="pt-4">
              <Button onClick={handleCopy} variant="outline" className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                {copied ? 'Copied!' : 'Copy Official Link'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Bookmark the Official Site
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Save the official URL in your browser's bookmarks to ensure you always access the legitimate CapsuleVault site.
          </p>
          <Button onClick={handleCopy} variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            {copied ? 'Copied!' : 'Copy Official Link'}
          </Button>
        </div>
      </div>
    </div>
  );
}
