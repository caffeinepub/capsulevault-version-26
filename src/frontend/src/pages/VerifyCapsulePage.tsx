import { CheckCircle, Search, Shield, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useGetCapsule } from "../hooks/useQueries";

interface VerifyCapsulePageProps {
  onNavigate: (page: Page) => void;
}

export function VerifyCapsulePage({
  onNavigate: _onNavigate,
}: VerifyCapsulePageProps) {
  const [claimCode, setClaimCode] = useState("");
  const [submittedClaimCode, setSubmittedClaimCode] = useState<string | null>(
    null,
  );

  const capsuleQuery = useGetCapsule(submittedClaimCode || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!claimCode.trim()) {
      toast.error("Please enter a claim code");
      return;
    }

    // Normalize: trim whitespace and convert to uppercase
    const normalized = claimCode.trim().toUpperCase();

    setSubmittedClaimCode(normalized);
  };

  const handleReset = () => {
    setClaimCode("");
    setSubmittedClaimCode(null);
  };

  const renderVerificationResult = () => {
    if (capsuleQuery.isLoading) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying capsule...</p>
          </CardContent>
        </Card>
      );
    }

    if (capsuleQuery.isError) {
      return (
        <Card className="border-destructive/50">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Not Found</h3>
            <p className="text-muted-foreground mb-6">
              No capsule exists with the provided claim code.
            </p>
            <Button onClick={handleReset}>Try Again</Button>
          </CardContent>
        </Card>
      );
    }

    const capsule = capsuleQuery.data;

    if (!capsule) {
      return null;
    }

    // Format unlock date/time
    const unlockDate = new Date(Number(capsule.metadata.unlockAt) / 1_000_000);
    const unlockDateStr = unlockDate.toLocaleDateString("en-GB");
    const unlockTimeStr = unlockDate.toLocaleTimeString("en-GB", {
      hour12: false,
    });

    // Extract creation timestamp
    const createdAtTimestamp = capsule.metadata.createdAtTimestamp;
    const createdDateStr =
      createdAtTimestamp?.date || "Unknown (legacy capsule)";
    const createdTimeStr = createdAtTimestamp?.time
      ? `${createdAtTimestamp.time} UTC`
      : "Unknown";

    return (
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-primary">Verified</h3>
          <p className="text-muted-foreground mb-6">
            This claim code exists and was locked.
          </p>
          <div className="bg-background rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Claim Code:</span>
                <code className="font-mono font-medium text-base">
                  {submittedClaimCode}
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Created On:</span>
                <span className="font-medium">{createdDateStr}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Created At:</span>
                <span className="font-medium">{createdTimeStr}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Unlock Date:</span>
                <span className="font-medium">{unlockDateStr}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Unlock Time:</span>
                <span className="font-medium">{unlockTimeStr} UTC</span>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Created on official CapsuleVault site
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Button onClick={handleReset}>Verify Another Capsule</Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Verify Capsule</h1>
        <p className="text-muted-foreground">
          Verify that a claim code exists and was locked
        </p>
      </div>

      {!submittedClaimCode ? (
        <Card>
          <CardHeader>
            <CardTitle>Enter Claim Code</CardTitle>
            <CardDescription>
              Provide the claim code to verify its authenticity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="claim-code">Claim Code</Label>
                <Input
                  id="claim-code"
                  placeholder="CAP-XXXXXX or CAPXXXXXX"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value)}
                  className="text-center text-lg font-mono tracking-wider"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Accepts both formats: CAP-XXXXXX or CAPXXXXXX
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg">
                <Search className="w-4 h-4 mr-2" />
                Verify Capsule
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        renderVerificationResult()
      )}

      <Alert className="mt-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Why verify?</strong> Verification confirms that a capsule was
          created on the official CapsuleVault site and hasn't been tampered
          with. This helps protect against fake sites and impersonation.
        </AlertDescription>
      </Alert>

      <Card className="mt-6 bg-muted/30">
        <CardContent className="py-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security Tips
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span>•</span>
              <span>Always verify capsules received from unknown sources</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Only trust capsules that show "Verified" status</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>
                Check that you're on the official site:
                https://capsulevault-1ie.caffeine.xyz/
              </span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>
                Fake sites cannot replicate authentic verification stamps
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
