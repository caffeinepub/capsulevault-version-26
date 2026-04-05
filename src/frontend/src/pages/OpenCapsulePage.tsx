import { ArrowLeft, Clock, Lock, Shield, Unlock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import { CountdownTimer } from "../components/CountdownTimer";
import { ReminderToggle } from "../components/ReminderToggle";
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
import { useCheckCapsuleExpiry, useGetCapsule } from "../hooks/useQueries";

interface OpenCapsulePageProps {
  onNavigate: (page: Page) => void;
}

export function OpenCapsulePage({ onNavigate }: OpenCapsulePageProps) {
  const [claimCode, setClaimCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const capsuleQuery = useGetCapsule(submittedCode || "");
  const expiryQuery = useCheckCapsuleExpiry(submittedCode || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!claimCode.trim()) {
      toast.error("Please enter a claim code");
      return;
    }

    // Normalize: trim whitespace and convert to uppercase
    const normalized = claimCode.trim().toUpperCase();
    setSubmittedCode(normalized);
  };

  const handleUnlock = () => {
    if (capsuleQuery.data && expiryQuery.data) {
      onNavigate({ type: "view", capsule: capsuleQuery.data });
    }
  };

  const isLoading = capsuleQuery.isLoading || expiryQuery.isLoading;
  const hasError = capsuleQuery.isError || expiryQuery.isError;
  const isUnlocked = expiryQuery.data === true;
  const capsule = capsuleQuery.data;

  // Check if error message indicates draft capsule
  const isDraftCapsule =
    hasError &&
    (capsuleQuery.error?.message?.includes("draft version") ||
      capsuleQuery.error?.message?.includes("not found in live storage"));

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => onNavigate({ type: "home" })}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>

      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Open Capsule</h1>
        <p className="text-muted-foreground">
          Enter your claim code to access your time-locked capsule
        </p>
      </div>

      <Alert className="mb-6 border-primary/50 bg-primary/5">
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Security reminder:</strong> CapsuleVault never unlocks
          capsules early and never asks for private codes.
        </AlertDescription>
      </Alert>

      {!submittedCode ? (
        <Card>
          <CardHeader>
            <CardTitle>Enter Claim Code</CardTitle>
            <CardDescription>
              The claim code was provided when the capsule was created
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
                />
                <p className="text-xs text-muted-foreground">
                  Accepts both formats: CAP-XXXXXX or CAPXXXXXX
                </p>
              </div>
              <Button type="submit" className="w-full" size="lg">
                <Unlock className="w-4 h-4 mr-2" />
                Check Capsule
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          {isLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Loading capsule...</p>
              </CardContent>
            </Card>
          )}

          {hasError && isDraftCapsule && (
            <Card className="border-destructive/50">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Draft Capsule Detected
                </h3>
                <p className="text-muted-foreground mb-6">
                  This capsule was created in a draft version. Please recreate
                  it in the live app.
                </p>
                <Button onClick={() => setSubmittedCode(null)}>
                  Try Another Code
                </Button>
              </CardContent>
            </Card>
          )}

          {hasError && !isDraftCapsule && (
            <Card className="border-destructive/50">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Capsule Not Found
                </h3>
                <p className="text-muted-foreground mb-6">
                  The claim code you entered doesn't match any capsule in live
                  storage. Please check and try again.
                </p>
                <div className="text-left max-w-md mx-auto mb-6 bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Possible reasons:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• The claim code may be incorrect</li>
                    <li>
                      • The capsule may have been created in a draft/test
                      environment
                    </li>
                    <li>
                      • The capsule may not exist in the production database
                    </li>
                  </ul>
                </div>
                <Button onClick={() => setSubmittedCode(null)}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {capsule && !isUnlocked && (
            <Card>
              <CardHeader>
                <CardTitle>Capsule Locked</CardTitle>
                <CardDescription>
                  This capsule will unlock on{" "}
                  {new Date(
                    Number(capsule.metadata.unlockAt) / 1_000_000,
                  ).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(
                    Number(capsule.metadata.unlockAt) / 1_000_000,
                  ).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}{" "}
                  UTC
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <img
                    src="/assets/generated/hourglass-icon-transparent.dim_64x64.png"
                    alt=""
                    className="w-16 h-16 mx-auto mb-6"
                  />
                  <CountdownTimer
                    targetTime={Number(capsule.metadata.unlockAt) / 1_000_000}
                    onComplete={() => expiryQuery.refetch()}
                  />
                </div>

                {/* Locked State - Only show timestamps */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Time Information</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Created On</p>
                      <p className="font-medium">
                        {capsule.metadata.createdAtTimestamp
                          ? capsule.metadata.createdAtTimestamp.date
                          : "Unknown (legacy capsule)"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Created At</p>
                      <p className="font-medium">
                        {capsule.metadata.createdAtTimestamp
                          ? `${capsule.metadata.createdAtTimestamp.time} ${capsule.metadata.createdAtTimestamp.timezone}`
                          : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Unlock On</p>
                      <p className="font-medium">
                        {new Date(
                          Number(capsule.metadata.unlockAt) / 1_000_000,
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Unlock At</p>
                      <p className="font-medium">
                        {new Date(
                          Number(capsule.metadata.unlockAt) / 1_000_000,
                        ).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })}{" "}
                        UTC
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reminder Toggle for Recipients */}
                <ReminderToggle
                  claimCode={capsule.metadata.claimCode}
                  unlockAt={Number(capsule.metadata.unlockAt) / 1_000_000}
                  capsuleType={capsule.metadata.capsuleType}
                  variant="inline"
                />

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    This capsule is time-locked. Come back after the unlock time
                    to view its contents.
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSubmittedCode(null)}
                >
                  Check Another Capsule
                </Button>
              </CardContent>
            </Card>
          )}

          {capsule && isUnlocked && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Unlock className="w-6 h-6 text-primary" />
                  Capsule Unlocked!
                </CardTitle>
                <CardDescription>
                  This capsule is now ready to be opened
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    {capsule.metadata.capsuleType === "love" ? (
                      <img
                        src="/assets/generated/message-icon-transparent.dim_64x64.png"
                        alt=""
                        className="w-12 h-12"
                      />
                    ) : (
                      <img
                        src="/assets/generated/prediction-icon-transparent.dim_64x64.png"
                        alt=""
                        className="w-12 h-12"
                      />
                    )}
                  </div>
                  <p className="text-lg font-medium mb-2">
                    {capsule.metadata.capsuleType === "love"
                      ? "Message Capsule"
                      : "Prediction Capsule"}
                  </p>
                </div>

                {/* Unlocked State - Show all verification details */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Verification Details</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Created On</p>
                      <p className="font-medium">
                        {capsule.metadata.createdAtTimestamp
                          ? capsule.metadata.createdAtTimestamp.date
                          : "Unknown (legacy capsule)"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Created At</p>
                      <p className="font-medium">
                        {capsule.metadata.createdAtTimestamp
                          ? `${capsule.metadata.createdAtTimestamp.time} ${capsule.metadata.createdAtTimestamp.timezone}`
                          : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Unlock On</p>
                      <p className="font-medium">
                        {new Date(
                          Number(capsule.metadata.unlockAt) / 1_000_000,
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Unlock At</p>
                      <p className="font-medium">
                        {new Date(
                          Number(capsule.metadata.unlockAt) / 1_000_000,
                        ).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })}{" "}
                        UTC
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Claim Code</span>
                      <code className="font-mono font-medium">
                        {capsule.metadata.claimCode}
                      </code>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Capsule Type
                      </span>
                      <span className="font-medium capitalize">
                        {capsule.metadata.capsuleType}
                      </span>
                    </div>
                    {capsule.content.__kind__ === "predictionCapsule" && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Commit ID</span>
                        <code className="font-mono text-xs">
                          {capsule.content.predictionCapsule.commitId.slice(
                            0,
                            12,
                          )}
                          ...
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleUnlock}>
                  <Unlock className="w-4 h-4 mr-2" />
                  Open Capsule
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
