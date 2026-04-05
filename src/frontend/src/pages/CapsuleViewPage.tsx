import { ArrowLeft, Clock, Lightbulb, Mail, Shield } from "lucide-react";
import type { Page } from "../App";
import type { Capsule } from "../backend";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";

interface CapsuleViewPageProps {
  capsule: Capsule;
  onNavigate: (page: Page) => void;
}

function calculateTimeLocked(createdAt: bigint, unlockAt: bigint): string {
  const createdMs = Number(createdAt) / 1_000_000;
  const unlockMs = Number(unlockAt) / 1_000_000;
  const diffMs = unlockMs - createdMs;

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    const remainingMonths = Math.floor((days % 365) / 30);
    return remainingMonths > 0
      ? `${years} year${years > 1 ? "s" : ""}, ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`
      : `${years} year${years > 1 ? "s" : ""}`;
  }
  if (months > 0) {
    const remainingDays = days % 30;
    return remainingDays > 0
      ? `${months} month${months > 1 ? "s" : ""}, ${remainingDays} day${remainingDays > 1 ? "s" : ""}`
      : `${months} month${months > 1 ? "s" : ""}`;
  }
  return `${days} day${days !== 1 ? "s" : ""}`;
}

export function CapsuleViewPage({ capsule, onNavigate }: CapsuleViewPageProps) {
  const isLove = capsule.content.__kind__ === "loveCapsule";
  const hasTimestamp = capsule.metadata.createdAtTimestamp !== undefined;
  const unlockDate = new Date(Number(capsule.metadata.unlockAt) / 1_000_000);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => onNavigate({ type: "home" })}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>

      <Alert className="mb-6 border-primary/50 bg-primary/5">
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Security reminder:</strong> CapsuleVault never unlocks
          capsules early and never asks for private codes.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {isLove ? (
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
              <div>
                <CardTitle className="text-2xl">
                  {isLove ? "Message Capsule" : "Prediction Capsule"}
                </CardTitle>
                <CardDescription>Unlocked</CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="capitalize">
                {isLove && capsule.content.__kind__ === "loveCapsule"
                  ? capsule.content.loveCapsule.category
                  : capsule.content.__kind__ === "predictionCapsule"
                    ? capsule.content.predictionCapsule.category
                    : ""}
              </Badge>
              <VerifiedBadge />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timestamp Information */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Verification Details</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Created On</p>
                <p className="font-medium">
                  {hasTimestamp
                    ? capsule.metadata.createdAtTimestamp!.date
                    : "Unknown (legacy capsule)"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Created At</p>
                <p className="font-medium">
                  {hasTimestamp
                    ? `${capsule.metadata.createdAtTimestamp!.time} ${capsule.metadata.createdAtTimestamp!.timezone}`
                    : "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Unlock On</p>
                <p className="font-medium">
                  {unlockDate.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Unlock At</p>
                <p className="font-medium">
                  {unlockDate.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}{" "}
                  UTC
                </p>
              </div>
            </div>

            {hasTimestamp && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Time Locked:</span>{" "}
                  {calculateTimeLocked(
                    capsule.metadata.createdAt,
                    capsule.metadata.unlockAt,
                  )}
                </p>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Claim Code</span>
                <code className="font-mono font-medium">
                  {capsule.metadata.claimCode}
                </code>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Capsule Type</span>
                <span className="font-medium capitalize">
                  {capsule.metadata.capsuleType}
                </span>
              </div>
              {!isLove && capsule.content.__kind__ === "predictionCapsule" && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Commit ID</span>
                  <code className="font-mono text-xs">
                    {capsule.content.predictionCapsule.commitId.slice(0, 12)}...
                  </code>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {isLove && capsule.content.__kind__ === "loveCapsule" ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="capitalize">
                    {capsule.content.loveCapsule.category}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    {capsule.content.loveCapsule.message}
                  </p>
                </div>
                {capsule.content.loveCapsule.note && (
                  <>
                    <Separator />
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground italic">
                        "{capsule.content.loveCapsule.note}"
                      </p>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : capsule.content.__kind__ === "predictionCapsule" ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lightbulb className="w-4 h-4" />
                  <span className="capitalize">
                    {capsule.content.predictionCapsule.category
                      .replace(/([A-Z])/g, " $1")
                      .trim()}
                  </span>
                </div>
                <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4">
                  <p className="text-lg font-medium mb-1">I predict that...</p>
                  <p className="text-lg leading-relaxed">
                    {capsule.content.predictionCapsule.prediction}
                  </p>
                </div>
                {capsule.content.predictionCapsule.confidence !== undefined && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Confidence:
                    </span>
                    <Badge variant="secondary" className="text-base">
                      {Number(capsule.content.predictionCapsule.confidence)}%
                    </Badge>
                  </div>
                )}
                {capsule.content.predictionCapsule.explanation && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Explanation:</p>
                      <p className="text-sm text-muted-foreground">
                        {capsule.content.predictionCapsule.explanation}
                      </p>
                    </div>
                  </>
                )}
                <Separator />
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Commit ID (Proof of Immutability)
                    </span>
                  </div>
                  <code className="text-xs font-mono bg-background px-2 py-1 rounded block break-all">
                    {capsule.content.predictionCapsule.commitId}
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    This cryptographic hash proves the prediction was made
                    before the unlock date.
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
