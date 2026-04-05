import { AlertCircle, Lock, Shield } from "lucide-react";
import type { Page } from "../App";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

interface SafetyPrivacyPageProps {
  onNavigate: (page: Page) => void;
}

export function SafetyPrivacyPage({
  onNavigate: _onNavigate,
}: SafetyPrivacyPageProps) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Privacy & Safety
        </h1>
        <p className="text-muted-foreground text-lg">
          How LockLetter protects your privacy and what you should know
        </p>
      </div>

      <div className="space-y-6">
        {/* Safety & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Safety & Privacy
            </CardTitle>
            <CardDescription>How your data is handled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>No accounts required.</strong> LockLetter doesn't collect
              personal information, emails, or passwords. You create capsules
              anonymously.
            </p>
            <p>
              <strong>Private claim codes.</strong> Each capsule has a unique
              claim code. Only people with the code can access it. Keep your
              codes private.
            </p>
            <p>
              <strong>Time-locked content.</strong> Capsules cannot be opened
              before their unlock date. This is enforced by the system.
            </p>
          </CardContent>
        </Card>

        {/* Responsible Use */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Responsible Use
            </CardTitle>
            <CardDescription>
              What you should know before creating capsules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>No moderation.</strong> LockLetter does not review capsule
              content before or after creation. You are responsible for what you
              write.
            </p>
            <p>
              <strong>Share responsibly.</strong> Only share claim codes with
              people you trust. Anyone with a code can open the capsule after
              the unlock date.
            </p>
            <p>
              <strong>Permanent after creation.</strong> Once created, capsules
              cannot be edited or deleted. Think carefully before locking your
              message.
            </p>
          </CardContent>
        </Card>

        {/* Technical Guarantees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Technical Guarantees
            </CardTitle>
            <CardDescription>What the system ensures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>Time-locks are enforced.</strong> The system prevents
              capsules from being opened before their unlock date. This cannot
              be bypassed.
            </p>
            <p>
              <strong>Claim codes are unique.</strong> Each capsule has a unique
              identifier. Codes are generated randomly and cannot be guessed.
            </p>
            <p>
              <strong>Commit IDs for predictions.</strong> Prediction capsules
              include a cryptographic commit ID that proves the content wasn't
              changed after creation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
