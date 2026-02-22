import { useState } from 'react';
import { Copy, Check, Home, Share2, Download, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import type { Page } from '../App';
import type { Capsule } from '../backend';

interface ClaimCodeReceiptPageProps {
  capsule: Capsule;
  onNavigate: (page: Page) => void;
}

const OFFICIAL_SITE_MESSAGE = '\n\n================================\nOFFICIAL SITE: https://capsulevault-1ie.caffeine.xyz/\nIf you opened this capsule anywhere else, it may be fake.\n================================';

export function ClaimCodeReceiptPage({ capsule, onNavigate }: ClaimCodeReceiptPageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(capsule.metadata.claimCode);
      setCopied(true);
      toast.success('Claim code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy claim code');
    }
  };

  const handleDownloadBackup = () => {
    const unlockDate = new Date(Number(capsule.metadata.unlockAt) / 1_000_000);
    const isPrediction = capsule.metadata.capsuleType === 'prediction';
    const hasTimestamp = capsule.metadata.createdAtTimestamp !== undefined;
    
    let backupContent = `CapsuleVault - Capsule Backup\n`;
    backupContent += `================================\n\n`;
    backupContent += `Claim Code: ${capsule.metadata.claimCode}\n`;
    backupContent += `Capsule Type: ${capsule.metadata.capsuleType.charAt(0).toUpperCase() + capsule.metadata.capsuleType.slice(1)}\n`;
    
    if (hasTimestamp) {
      backupContent += `Created On: ${capsule.metadata.createdAtTimestamp!.date}\n`;
      backupContent += `Created At: ${capsule.metadata.createdAtTimestamp!.time} ${capsule.metadata.createdAtTimestamp!.timezone}\n`;
    }
    
    backupContent += `Unlock Date: ${unlockDate.toLocaleDateString()}\n`;
    backupContent += `Unlock Time: ${unlockDate.toLocaleTimeString()}\n`;
    
    if (isPrediction && capsule.content.__kind__ === 'predictionCapsule') {
      backupContent += `Commit ID: ${capsule.content.predictionCapsule.commitId}\n`;
    }
    
    backupContent += `\n================================\n`;
    backupContent += `IMPORTANT INSTRUCTIONS:\n`;
    backupContent += `1. Keep your claim code safe. It's the only way to access your capsule.\n`;
    backupContent += `2. To open the capsule, go to the official CapsuleVault site, select 'Open Capsule,' and enter your claim code when the unlock date arrives.\n`;
    backupContent += `3. Share the claim code only with people you trust.\n`;
    backupContent += OFFICIAL_SITE_MESSAGE;

    const blob = new Blob([backupContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CapsuleVault-Backup-${capsule.metadata.claimCode}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Backup file downloaded!');
  };

  const handleShare = async () => {
    const shareText = `I've created a time-locked capsule for you! Use this claim code to open it after ${new Date(Number(capsule.metadata.unlockAt) / 1_000_000).toLocaleDateString()}: ${capsule.metadata.claimCode}\n\nTo open: Go to https://capsulevault-1ie.caffeine.xyz/, select 'Open Capsule,' and enter your claim code when the unlock date arrives.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CapsuleVault - Time-Locked Message',
          text: shareText
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Share text copied to clipboard!');
    }
  };

  const unlockDate = new Date(Number(capsule.metadata.unlockAt) / 1_000_000);
  const isPrediction = capsule.metadata.capsuleType === 'prediction';
  const hasTimestamp = capsule.metadata.createdAtTimestamp !== undefined;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <img 
            src="/assets/generated/lock-key-icon-transparent.dim_64x64.png" 
            alt="" 
            className="w-12 h-12"
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Capsule Created!</h1>
        <p className="text-muted-foreground">
          Your {isPrediction ? 'prediction' : 'message'} has been securely locked
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Claim Code</CardTitle>
          <CardDescription>
            Share this code with the recipient. They'll need it to unlock the capsule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <code className="text-2xl font-mono font-bold flex-1 text-center tracking-wider">
              {capsule.metadata.claimCode}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              title="Copy Claim Code"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleCopy} className="w-full">
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Claim Code'}
            </Button>
            <Button variant="outline" onClick={handleDownloadBackup} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Backup
            </Button>
          </div>

          <Button className="w-full" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Code
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Capsule Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hasTimestamp && (
            <>
              <div className="bg-muted/50 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Creation Timestamp</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Created On</p>
                    <p className="font-medium">{capsule.metadata.createdAtTimestamp!.date}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Created At</p>
                    <p className="font-medium">{capsule.metadata.createdAtTimestamp!.time} {capsule.metadata.createdAtTimestamp!.timezone}</p>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Claim Code</span>
            <code className="font-mono font-medium">{capsule.metadata.claimCode}</code>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium capitalize">{capsule.metadata.capsuleType}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Unlock Date</span>
            <span className="font-medium">{unlockDate.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Unlock Time</span>
            <span className="font-medium">{unlockDate.toLocaleTimeString()}</span>
          </div>
          {isPrediction && capsule.content.__kind__ === 'predictionCapsule' && (
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Commit ID</span>
              <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                {capsule.content.predictionCapsule.commitId.slice(0, 12)}...
              </code>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-muted/50 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-3">Important Instructions:</h3>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>Keep your claim code safe. It's the only way to access your capsule.</li>
          <li>To open the capsule, go to the official CapsuleVault site, select 'Open Capsule,' and enter your claim code when the unlock date arrives.</li>
          <li>Share the claim code only with people you trust.</li>
        </ol>
        {hasTimestamp && (
          <p className="mt-4 text-sm text-muted-foreground">
            The creation timestamp proves when this capsule was created.
          </p>
        )}
        {isPrediction && (
          <p className="mt-2 text-sm text-muted-foreground">
            The commit ID proves your prediction was made before the unlock date.
          </p>
        )}
      </div>

      <Button 
        className="w-full" 
        size="lg"
        onClick={() => onNavigate({ type: 'home' })}
      >
        <Home className="w-4 h-4 mr-2" />
        Back to Home
      </Button>
    </div>
  );
}
