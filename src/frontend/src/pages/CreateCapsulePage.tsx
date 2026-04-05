import { ArrowLeft, Calendar, Lightbulb, Lock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import { LoveCategory, PredictionCategory } from "../backend";
import { BackendHealthBanner } from "../components/BackendHealthBanner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { useBackendHealth, useCreateCapsule } from "../hooks/useQueries";
import {
  calculateReminderTimes,
  canShowNotifications,
  requestNotificationPermission,
  saveReminder,
} from "../lib/reminders";

interface CreateCapsulePageProps {
  initialType?: "love" | "prediction";
  onNavigate: (page: Page) => void;
}

export function CreateCapsulePage({
  initialType,
  onNavigate,
}: CreateCapsulePageProps) {
  const [step, setStep] = useState<"type" | "form">(
    initialType ? "form" : "type",
  );
  const [capsuleType, setCapsuleType] = useState<"love" | "prediction" | null>(
    initialType || null,
  );

  // Love capsule fields
  const [loveCategory, setLoveCategory] = useState<LoveCategory>(
    LoveCategory.appreciation,
  );
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");

  // Prediction capsule fields
  const [predictionCategory, setPredictionCategory] =
    useState<PredictionCategory>(PredictionCategory.personal);
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState("");
  const [explanation, setExplanation] = useState("");

  // Common fields
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("12:00");

  // Reminder toggle - default to true for automatic scheduling
  const [enableReminder, setEnableReminder] = useState(true);

  // Debug log state
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const createCapsuleMutation = useCreateCapsule();
  const {
    data: isBackendHealthy,
    isLoading: isHealthCheckLoading,
    refetch: refetchHealth,
  } = useBackendHealth();

  // Check health on component mount
  useEffect(() => {
    refetchHealth();
  }, [refetchHealth]);

  const addDebugLog = (message: string) => {
    setDebugLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  const handleTypeSelect = (type: "love" | "prediction") => {
    setCapsuleType(type);
    setStep("form");
  };

  const handleSubmit = async () => {
    addDebugLog("Lock Capsule button clicked");

    // Check backend health before proceeding
    addDebugLog("Checking backend health...");
    const healthCheck = await refetchHealth();

    if (!healthCheck.data) {
      addDebugLog("Backend health check: FAILED - Storage offline");
      toast.error("Storage temporarily offline. Please try again shortly.");
      return;
    }

    addDebugLog("Backend health check: PASSED");

    // Validation
    let validationResult = "valid";
    let validationReason = "";

    if (!unlockDate) {
      validationResult = "invalid";
      validationReason = "No unlock date selected";
      addDebugLog(
        `Validation result: ${validationResult} - ${validationReason}`,
      );
      toast.error("Please select an unlock date");
      return;
    }

    const unlockDateTime = new Date(`${unlockDate}T${unlockTime}`);
    const now = new Date();
    const minUnlock = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    if (unlockDateTime < minUnlock) {
      validationResult = "invalid";
      validationReason = "Unlock time must be at least 24 hours in the future";
      addDebugLog(
        `Validation result: ${validationResult} - ${validationReason}`,
      );
      toast.error("Unlock time must be at least 24 hours in the future");
      return;
    }

    if (capsuleType === "love") {
      if (!message.trim()) {
        validationResult = "invalid";
        validationReason = "Message is empty";
        addDebugLog(
          `Validation result: ${validationResult} - ${validationReason}`,
        );
        toast.error("Please enter a message");
        return;
      }
      if (note.length > 120) {
        validationResult = "invalid";
        validationReason = "Note exceeds 120 characters";
        addDebugLog(
          `Validation result: ${validationResult} - ${validationReason}`,
        );
        toast.error("Note must be 120 characters or less");
        return;
      }
    } else if (capsuleType === "prediction") {
      if (!prediction.trim()) {
        validationResult = "invalid";
        validationReason = "Prediction is empty";
        addDebugLog(
          `Validation result: ${validationResult} - ${validationReason}`,
        );
        toast.error("Please enter a prediction");
        return;
      }
      if (explanation.length > 120) {
        validationResult = "invalid";
        validationReason = "Explanation exceeds 120 characters";
        addDebugLog(
          `Validation result: ${validationResult} - ${validationReason}`,
        );
        toast.error("Explanation must be 120 characters or less");
        return;
      }
    }

    addDebugLog(`Validation result: ${validationResult}`);

    try {
      addDebugLog("Starting capsule creation...");

      const capsule = await createCapsuleMutation.mutateAsync({
        type: capsuleType!,
        unlockTime: BigInt(unlockDateTime.getTime() * 1_000_000),
        loveData:
          capsuleType === "love"
            ? {
                category: loveCategory,
                message,
                note: note.trim() || undefined,
                anonymous: false,
              }
            : undefined,
        predictionData:
          capsuleType === "prediction"
            ? {
                category: predictionCategory,
                prediction,
                confidence: confidence ? BigInt(confidence) : undefined,
                explanation: explanation.trim() || undefined,
              }
            : undefined,
      });

      addDebugLog(`Generated claim code: ${capsule.metadata.claimCode}`);
      addDebugLog("Storage operation: SUCCESS - Capsule persisted to backend");
      addDebugLog("Persistence verified: Capsule retrieved successfully");

      // Handle reminder if enabled
      if (enableReminder) {
        addDebugLog("Reminder enabled - setting up notification schedule");

        // Calculate reminder times
        const unlockTimestamp = unlockDateTime.getTime();
        const reminderTimes = calculateReminderTimes(unlockTimestamp);

        addDebugLog("Reminder schedule calculated:");
        addDebugLog(
          `  - 24h reminder: ${reminderTimes.twentyFourHour.toLocaleString()}`,
        );
        addDebugLog(
          `  - 1h reminder: ${reminderTimes.oneHour.toLocaleString()}`,
        );
        addDebugLog(
          `  - Unlock time: ${reminderTimes.unlock.toLocaleString()}`,
        );

        // Request notification permission if needed
        if (!canShowNotifications()) {
          addDebugLog("Requesting notification permission...");
          const granted = await requestNotificationPermission();
          if (!granted) {
            addDebugLog("Notification permission denied by user");
            toast.error("Notification permission denied. Reminder not set.");
          } else {
            addDebugLog("Notification permission granted");
          }
        } else {
          addDebugLog("Notification permission already granted");
        }

        if (canShowNotifications()) {
          try {
            saveReminder({
              claimCode: capsule.metadata.claimCode,
              unlockAt: unlockTimestamp,
              capsuleType: capsuleType!,
              createdAt: Date.now(),
            });
            addDebugLog("Reminder saved successfully to localStorage");
            addDebugLog("Notifications will be sent at scheduled times");
            toast.success(
              "Reminder set! You'll be notified 24h and 1h before unlock.",
            );
          } catch (error) {
            addDebugLog(`Reminder save failed: ${error}`);
            toast.error("Failed to set reminder");
          }
        }
      } else {
        addDebugLog("Reminder not enabled - skipping notification setup");
      }

      // Navigate
      try {
        onNavigate({ type: "receipt", capsule });
        addDebugLog("Navigation operation: SUCCESS");
      } catch (navError) {
        addDebugLog(`Navigation operation: FAILED - ${navError}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      addDebugLog(`Storage operation: FAILED - ${errorMessage}`);

      if (errorMessage.includes("storage not confirmed")) {
        toast.error(
          "Error saving capsule. Please try again later — storage not confirmed.",
        );
      } else if (errorMessage.includes("Storage temporarily offline")) {
        toast.error("Storage temporarily offline. Please try again shortly.");
      } else {
        toast.error("Failed to create capsule. Please try again.");
      }
      console.error("Capsule creation error:", error);
    }
  };

  const isLockButtonDisabled =
    createCapsuleMutation.isPending ||
    !isBackendHealthy ||
    isHealthCheckLoading;

  if (step === "type") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => onNavigate({ type: "home" })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <BackendHealthBanner
          isHealthy={isBackendHealthy ?? true}
          isLoading={isHealthCheckLoading}
        />

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Capsule Type
          </h1>
          <p className="text-muted-foreground">
            Select the type of time capsule you want to create
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50"
            onClick={() => handleTypeSelect("love")}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <img
                  src="/assets/generated/message-icon-transparent.dim_64x64.png"
                  alt=""
                  className="w-12 h-12"
                />
                <CardTitle className="text-2xl">Message Capsule</CardTitle>
              </div>
              <CardDescription>
                Write something meaningful now. It unlocks later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Create Message Capsule
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50"
            onClick={() => handleTypeSelect("prediction")}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <img
                  src="/assets/generated/prediction-icon-transparent.dim_64x64.png"
                  alt=""
                  className="w-12 h-12"
                />
                <CardTitle className="text-2xl">Prediction Capsule</CardTitle>
              </div>
              <CardDescription>
                Lock a prediction now. See it later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Create Prediction Capsule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Button variant="ghost" className="mb-6" onClick={() => setStep("type")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <BackendHealthBanner
        isHealthy={isBackendHealthy ?? true}
        isLoading={isHealthCheckLoading}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {capsuleType === "love" ? (
              <Mail className="w-8 h-8 text-primary" />
            ) : (
              <Lightbulb className="w-8 h-8 text-primary" />
            )}
            <div>
              <CardTitle className="text-2xl">
                {capsuleType === "love"
                  ? "Create Message Capsule"
                  : "Create Prediction Capsule"}
              </CardTitle>
              <CardDescription>
                {capsuleType === "love"
                  ? "Compose a heartfelt message to be unlocked in the future"
                  : "Record a prediction that will be revealed at a future date"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {capsuleType === "love" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="love-category">Category</Label>
                <Select
                  value={loveCategory}
                  onValueChange={(v) => setLoveCategory(v as LoveCategory)}
                >
                  <SelectTrigger id="love-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LoveCategory.appreciation}>
                      Appreciation
                    </SelectItem>
                    <SelectItem value={LoveCategory.encouragement}>
                      Encouragement
                    </SelectItem>
                    <SelectItem value={LoveCategory.celebration}>
                      Love
                    </SelectItem>
                    <SelectItem value={LoveCategory.apology}>
                      Apology
                    </SelectItem>
                    <SelectItem value={LoveCategory.reflection}>
                      Closure
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Your Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Write your heartfelt message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">
                  Short Note (Optional, max 120 characters)
                </Label>
                <Input
                  id="note"
                  placeholder="Add a brief note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={120}
                />
                <p className="text-xs text-muted-foreground">
                  {note.length}/120 characters
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="pred-category">Category</Label>
                <Select
                  value={predictionCategory}
                  onValueChange={(v) =>
                    setPredictionCategory(v as PredictionCategory)
                  }
                >
                  <SelectTrigger id="pred-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PredictionCategory.personal}>
                      Personal
                    </SelectItem>
                    <SelectItem value={PredictionCategory.work}>
                      Work
                    </SelectItem>
                    <SelectItem value={PredictionCategory.money}>
                      Money
                    </SelectItem>
                    <SelectItem value={PredictionCategory.sportsEvents}>
                      Sports/Events
                    </SelectItem>
                    <SelectItem value={PredictionCategory.life}>
                      Life
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prediction">I predict that... *</Label>
                <Textarea
                  id="prediction"
                  placeholder="Enter your prediction here..."
                  value={prediction}
                  onChange={(e) => setPrediction(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidence">
                  Confidence Level (Optional, 0-100%)
                </Label>
                <Input
                  id="confidence"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 75"
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">
                  Explanation (Optional, max 120 characters)
                </Label>
                <Input
                  id="explanation"
                  placeholder="Why do you think this will happen?"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  maxLength={120}
                />
                <p className="text-xs text-muted-foreground">
                  {explanation.length}/120 characters
                </p>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4" />
              <span>Unlock Date & Time</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unlock-date">Date *</Label>
                <Input
                  id="unlock-date"
                  type="date"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  min={
                    new Date(Date.now() + 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unlock-time">Time *</Label>
                <Input
                  id="unlock-time"
                  type="time"
                  value={unlockTime}
                  onChange={(e) => setUnlockTime(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum unlock time: 24 hours from now
            </p>
          </div>

          <Separator />

          {/* Reminder Toggle */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="reminder-toggle"
                  className="text-base font-medium cursor-pointer"
                >
                  Set Reminder
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified 24h and 1h before unlock
                </p>
              </div>
              <Switch
                id="reminder-toggle"
                checked={enableReminder}
                onCheckedChange={setEnableReminder}
              />
            </div>
            {enableReminder && (
              <p className="text-xs text-muted-foreground">
                You'll receive browser notifications before this capsule
                unlocks.
                <span className="block mt-1 text-destructive/80">
                  Note: Clearing browser data will remove reminders.
                </span>
              </p>
            )}
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={isLockButtonDisabled}
          >
            {createCapsuleMutation.isPending ? (
              "Creating Capsule..."
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Lock Capsule
              </>
            )}
          </Button>

          {/* Debug Log Panel */}
          {debugLogs.length > 0 && (
            <div className="mt-6 border-2 border-primary/30 rounded-lg p-4 bg-muted/50">
              <h3 className="text-sm font-semibold mb-2 text-primary">
                Debug Log
              </h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {debugLogs.map((log) => (
                  <div
                    key={log}
                    className="text-xs font-mono text-foreground/80 bg-background/50 px-2 py-1 rounded"
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
