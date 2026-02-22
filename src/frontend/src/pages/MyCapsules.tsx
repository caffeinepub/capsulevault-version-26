import { useState, useEffect } from 'react';
import { Download, Lock, Unlock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useGetCapsulesByVaultKey } from '../hooks/useQueries';
import { getVaultKeyHash } from '../lib/vaultKey';
import { toast } from 'sonner';
import type { Page } from '../App';

interface MyCapsulesProps {
  onNavigate: (page: Page) => void;
}

export function MyCapsules({ onNavigate }: MyCapsulesProps) {
  const [vaultKeyHash, setVaultKeyHash] = useState<string | null>(null);
  const { data: capsules, isLoading } = useGetCapsulesByVaultKey(vaultKeyHash || '');

  useEffect(() => {
    // Get vault key hash on mount
    getVaultKeyHash().then(hash => {
      setVaultKeyHash(hash);
    });
  }, []);

  const handleExportCodes = () => {
    if (!capsules || capsules.length === 0) {
      toast.error('No capsules to export');
      return;
    }

    let exportContent = 'CapsuleVault - My Capsule Codes\n';
    exportContent += '================================\n\n';

    capsules.forEach((capsule, index) => {
      const unlockDate = new Date(Number(capsule.metadata.unlockAt) / 1_000_000);
      const isUnlocked = Date.now() > unlockDate.getTime();

      exportContent += `Capsule ${index + 1}\n`;
      exportContent += `Claim Code: ${capsule.metadata.claimCode}\n`;
      exportContent += `Type: ${capsule.metadata.capsuleType.charAt(0).toUpperCase() + capsule.metadata.capsuleType.slice(1)}\n`;
      exportContent += `Unlock Date: ${unlockDate.toLocaleDateString()}\n`;
      exportContent += `Unlock Time: ${unlockDate.toLocaleTimeString()}\n`;
      exportContent += `Status: ${isUnlocked ? 'Unlocked' : 'Locked'}\n`;

      if (capsule.content.__kind__ === 'predictionCapsule') {
        exportContent += `Commit ID: ${capsule.content.predictionCapsule.commitId}\n`;
      }

      exportContent += '\n';
    });

    exportContent += '================================\n';
    exportContent += 'OFFICIAL SITE: https://capsulevault-1ie.caffeine.xyz/\n';
    exportContent += 'If you opened this file from anywhere else, it may be fake.\n';

    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CapsuleVault-Codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Codes exported successfully!');
  };

  if (!vaultKeyHash) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No Vault Key found. Create a capsule to get started.
            </p>
            <Button onClick={() => onNavigate({ type: 'create' })}>
              Create Capsule
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">My Capsules</h1>
        <p className="text-muted-foreground">
          View and manage your time-locked capsules
        </p>
      </div>

      <div className="mb-6 flex justify-end">
        <Button
          onClick={handleExportCodes}
          disabled={!capsules || capsules.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Codes
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading capsules...</p>
          </CardContent>
        </Card>
      ) : !capsules || capsules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't created any capsules yet.
            </p>
            <Button onClick={() => onNavigate({ type: 'create' })}>
              Create Your First Capsule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {capsules.map((capsule) => {
            const unlockDate = new Date(Number(capsule.metadata.unlockAt) / 1_000_000);
            const isUnlocked = Date.now() > unlockDate.getTime();
            const isPrediction = capsule.metadata.capsuleType === 'prediction';

            return (
              <Card key={capsule.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {isPrediction ? (
                        <img 
                          src="/assets/generated/prediction-icon-transparent.dim_64x64.png" 
                          alt="" 
                          className="w-10 h-10"
                        />
                      ) : (
                        <img 
                          src="/assets/generated/message-icon-transparent.dim_64x64.png" 
                          alt="" 
                          className="w-10 h-10"
                        />
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          {isPrediction ? 'Prediction Capsule' : 'Message Capsule'}
                        </CardTitle>
                        <CardDescription>
                          <code className="font-mono text-xs">{capsule.metadata.claimCode}</code>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={isUnlocked ? 'default' : 'secondary'}>
                      {isUnlocked ? (
                        <>
                          <Unlock className="w-3 h-3 mr-1" />
                          Unlocked
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Unlock Date</p>
                      <p className="font-medium">{unlockDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Unlock Time</p>
                      <p className="font-medium">{unlockDate.toLocaleTimeString()}</p>
                    </div>
                  </div>
                  {isUnlocked && (
                    <Button
                      className="w-full mt-4"
                      variant="outline"
                      onClick={() => onNavigate({ type: 'view', capsule })}
                    >
                      View Capsule
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
