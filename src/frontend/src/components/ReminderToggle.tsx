import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  canShowNotifications,
  hasAskedForNotificationPermission,
  hasReminder,
  removeReminder,
  requestNotificationPermission,
  saveReminder,
} from "../lib/reminders";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";

interface ReminderToggleProps {
  claimCode: string;
  unlockAt: number; // timestamp in milliseconds
  capsuleType?: "love" | "prediction";
  variant?: "button" | "inline";
}

export function ReminderToggle({
  claimCode,
  unlockAt,
  capsuleType,
  variant = "button",
}: ReminderToggleProps) {
  const [isReminderSet, setIsReminderSet] = useState(false);
  const [showPermissionInfo, setShowPermissionInfo] = useState(false);

  useEffect(() => {
    setIsReminderSet(hasReminder(claimCode));
  }, [claimCode]);

  const handleToggleReminder = async () => {
    if (isReminderSet) {
      removeReminder(claimCode);
      setIsReminderSet(false);
      toast.success("Reminder removed");
      return;
    }

    if (!("Notification" in window)) {
      toast.error("Notifications are not supported in your browser");
      return;
    }

    if (!canShowNotifications()) {
      const hasAsked = hasAskedForNotificationPermission();

      if (!hasAsked) {
        setShowPermissionInfo(true);
      }

      const granted = await requestNotificationPermission();

      if (!granted) {
        toast.error(
          "Notification permission denied. Please enable notifications in your browser settings.",
        );
        return;
      }
    }

    try {
      saveReminder({
        claimCode,
        unlockAt,
        capsuleType,
        createdAt: Date.now(),
      });
      setIsReminderSet(true);
      toast.success(
        "Reminder set! You'll be notified 24 hours and 1 hour before unlock.",
      );
    } catch (_error) {
      toast.error("Failed to set reminder. Please try again.");
    }
  };

  if (variant === "inline") {
    return (
      <div className="space-y-3">
        {showPermissionInfo && !canShowNotifications() && (
          <Alert className="border-primary/50 bg-primary/5">
            <Bell className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Enable notifications:</strong> We'll send you reminders 24
              hours and 1 hour before this capsule unlocks. Click the button
              below to allow notifications.
            </AlertDescription>
          </Alert>
        )}

        <Button
          variant={isReminderSet ? "outline" : "default"}
          size="sm"
          onClick={handleToggleReminder}
          className="w-full"
        >
          {isReminderSet ? (
            <>
              <BellOff className="w-4 h-4 mr-2" />
              Remove Reminder
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Remind Me When This Unlocks
            </>
          )}
        </Button>

        {isReminderSet && (
          <p className="text-xs text-muted-foreground text-center">
            You'll receive notifications 24h and 1h before unlock
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showPermissionInfo && !canShowNotifications() && (
        <Alert className="border-primary/50 bg-primary/5">
          <Bell className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Enable notifications:</strong> We'll send you reminders 24
            hours and 1 hour before this capsule unlocks.
          </AlertDescription>
        </Alert>
      )}

      <Button
        variant={isReminderSet ? "outline" : "secondary"}
        size="lg"
        onClick={handleToggleReminder}
        className="w-full"
      >
        {isReminderSet ? (
          <>
            <BellOff className="w-4 h-4 mr-2" />
            Reminder Set
          </>
        ) : (
          <>
            <Bell className="w-4 h-4 mr-2" />
            Set Reminder for Unlock
          </>
        )}
      </Button>

      {isReminderSet && (
        <p className="text-xs text-muted-foreground text-center">
          You'll receive browser notifications 24 hours and 1 hour before
          unlock.
          <span className="block mt-1 text-destructive/80">
            Note: Clearing browser data will remove this reminder.
          </span>
        </p>
      )}
    </div>
  );
}
