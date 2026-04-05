// Local reminder system for capsule unlocks

const REMINDERS_STORAGE_KEY = "capsuleReminders";
const NOTIFICATION_PERMISSION_KEY = "notificationPermissionAsked";
const NOTIFIED_REMINDERS_KEY = "notifiedReminders";

export interface CapsuleReminder {
  claimCode: string;
  unlockAt: number; // timestamp in milliseconds
  capsuleType?: "love" | "prediction";
  createdAt: number; // when reminder was set
}

interface NotifiedReminder {
  claimCode: string;
  notifiedAt24h: boolean;
  notifiedAt1h: boolean;
  notifiedAtUnlock: boolean;
}

/**
 * Get all reminders from localStorage
 */
export function getAllReminders(): CapsuleReminder[] {
  try {
    const stored = localStorage.getItem(REMINDERS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading reminders:", error);
    return [];
  }
}

/**
 * Get notified reminders tracking
 */
function getNotifiedReminders(): NotifiedReminder[] {
  try {
    const stored = localStorage.getItem(NOTIFIED_REMINDERS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading notified reminders:", error);
    return [];
  }
}

/**
 * Save notified reminders tracking
 */
function saveNotifiedReminders(notified: NotifiedReminder[]): void {
  try {
    localStorage.setItem(NOTIFIED_REMINDERS_KEY, JSON.stringify(notified));
  } catch (error) {
    console.error("Error saving notified reminders:", error);
  }
}

/**
 * Mark a reminder as notified for a specific time window
 */
function markAsNotified(
  claimCode: string,
  window: "24h" | "1h" | "unlock",
): void {
  const notified = getNotifiedReminders();
  const existing = notified.find((n) => n.claimCode === claimCode);

  if (existing) {
    if (window === "24h") existing.notifiedAt24h = true;
    if (window === "1h") existing.notifiedAt1h = true;
    if (window === "unlock") existing.notifiedAtUnlock = true;
  } else {
    notified.push({
      claimCode,
      notifiedAt24h: window === "24h",
      notifiedAt1h: window === "1h",
      notifiedAtUnlock: window === "unlock",
    });
  }

  saveNotifiedReminders(notified);
}

/**
 * Check if a reminder has been notified for a specific window
 */
function hasBeenNotified(
  claimCode: string,
  window: "24h" | "1h" | "unlock",
): boolean {
  const notified = getNotifiedReminders();
  const existing = notified.find((n) => n.claimCode === claimCode);

  if (!existing) return false;

  if (window === "24h") return existing.notifiedAt24h;
  if (window === "1h") return existing.notifiedAt1h;
  if (window === "unlock") return existing.notifiedAtUnlock;

  return false;
}

/**
 * Save a reminder for a capsule
 */
export function saveReminder(reminder: CapsuleReminder): void {
  try {
    const reminders = getAllReminders();

    // Check if reminder already exists for this claim code
    const existingIndex = reminders.findIndex(
      (r) => r.claimCode === reminder.claimCode,
    );

    if (existingIndex >= 0) {
      // Update existing reminder
      reminders[existingIndex] = reminder;
    } else {
      // Add new reminder
      reminders.push(reminder);
    }

    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error("Error saving reminder:", error);
    throw new Error("Failed to save reminder");
  }
}

/**
 * Remove a reminder by claim code
 */
export function removeReminder(claimCode: string): void {
  try {
    const reminders = getAllReminders();
    const filtered = reminders.filter((r) => r.claimCode !== claimCode);
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(filtered));

    // Also remove from notified tracking
    const notified = getNotifiedReminders();
    const filteredNotified = notified.filter((n) => n.claimCode !== claimCode);
    saveNotifiedReminders(filteredNotified);
  } catch (error) {
    console.error("Error removing reminder:", error);
  }
}

/**
 * Check if a reminder exists for a claim code
 */
export function hasReminder(claimCode: string): boolean {
  const reminders = getAllReminders();
  return reminders.some((r) => r.claimCode === claimCode);
}

/**
 * Get reminder for a specific claim code
 */
export function getReminder(claimCode: string): CapsuleReminder | null {
  const reminders = getAllReminders();
  return reminders.find((r) => r.claimCode === claimCode) || null;
}

/**
 * Clean up expired reminders (unlockAt has passed by more than 1 hour)
 */
export function cleanupExpiredReminders(): void {
  try {
    const reminders = getAllReminders();
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    // Keep reminders until 1 hour after unlock
    const active = reminders.filter((r) => r.unlockAt > now - oneHour);
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(active));

    // Clean up notified tracking for removed reminders
    const notified = getNotifiedReminders();
    const activeCodes = new Set(active.map((r) => r.claimCode));
    const filteredNotified = notified.filter((n) =>
      activeCodes.has(n.claimCode),
    );
    saveNotifiedReminders(filteredNotified);
  } catch (error) {
    console.error("Error cleaning up reminders:", error);
  }
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    localStorage.setItem(NOTIFICATION_PERMISSION_KEY, "true");
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
}

/**
 * Check if notification permission has been asked before
 */
export function hasAskedForNotificationPermission(): boolean {
  return localStorage.getItem(NOTIFICATION_PERMISSION_KEY) === "true";
}

/**
 * Check if notifications are supported and permitted
 */
export function canShowNotifications(): boolean {
  return "Notification" in window && Notification.permission === "granted";
}

/**
 * Show a browser notification
 */
export function showNotification(
  title: string,
  body: string,
  icon?: string,
): void {
  if (!canShowNotifications()) return;

  try {
    new Notification(title, {
      body,
      icon:
        icon ||
        "/assets/generated/reminder-bell-icon-transparent.dim_24x24.png",
      badge: "/assets/generated/reminder-bell-icon-transparent.dim_24x24.png",
      tag: "capsule-reminder",
      requireInteraction: false,
    });
  } catch (error) {
    console.error("Error showing notification:", error);
  }
}

/**
 * Get notification title based on capsule type
 */
function getNotificationTitle(
  capsuleType?: "love" | "prediction",
  isUnlocked = false,
): string {
  if (isUnlocked) {
    return "Your CapsuleVault capsule is unlocked!";
  }

  if (capsuleType === "love") {
    return "Your CapsuleVault message unlocks soon";
  }
  if (capsuleType === "prediction") {
    return "Your prediction unlocks soon";
  }

  return "Your CapsuleVault capsule unlocks soon";
}

/**
 * Check reminders and show notifications for upcoming unlocks
 * Should be called periodically (e.g., every minute)
 */
export function checkAndNotifyReminders(): void {
  if (!canShowNotifications()) return;

  const reminders = getAllReminders();
  const now = Date.now();

  for (const reminder of reminders) {
    const timeUntilUnlock = reminder.unlockAt - now;

    // 24 hours = 86400000 ms, check within 5 minute window
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;
    const fiveMinutes = 5 * 60 * 1000;

    // Check if we're within 5 minutes of 24 hours before unlock
    if (
      timeUntilUnlock > twentyFourHours - fiveMinutes &&
      timeUntilUnlock <= twentyFourHours
    ) {
      if (!hasBeenNotified(reminder.claimCode, "24h")) {
        const title = getNotificationTitle(reminder.capsuleType);
        showNotification(
          title,
          `Your capsule (${reminder.claimCode}) unlocks in 24 hours!`,
        );
        markAsNotified(reminder.claimCode, "24h");
      }
    }

    // Check if we're within 5 minutes of 1 hour before unlock
    if (timeUntilUnlock > oneHour - fiveMinutes && timeUntilUnlock <= oneHour) {
      if (!hasBeenNotified(reminder.claimCode, "1h")) {
        const title = getNotificationTitle(reminder.capsuleType);
        showNotification(
          title,
          `Your capsule (${reminder.claimCode}) unlocks in 1 hour!`,
        );
        markAsNotified(reminder.claimCode, "1h");
      }
    }

    // Check if unlock time has passed (within 5 minutes)
    if (timeUntilUnlock <= 0 && timeUntilUnlock > -fiveMinutes) {
      if (!hasBeenNotified(reminder.claimCode, "unlock")) {
        const title = getNotificationTitle(reminder.capsuleType, true);
        showNotification(
          title,
          `Your capsule (${reminder.claimCode}) is now unlocked and ready to open!`,
        );
        markAsNotified(reminder.claimCode, "unlock");
      }
    }
  }

  // Clean up expired reminders
  cleanupExpiredReminders();
}

/**
 * Initialize reminder checking interval
 * Returns cleanup function to stop checking
 */
export function startReminderChecking(): () => void {
  // Check immediately
  checkAndNotifyReminders();

  // Check every minute
  const intervalId = setInterval(checkAndNotifyReminders, 60 * 1000);

  return () => clearInterval(intervalId);
}

/**
 * Format time until unlock for display
 */
export function formatTimeUntilUnlock(unlockAt: number): string {
  const now = Date.now();
  const diff = unlockAt - now;

  if (diff <= 0) return "Unlocked";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Calculate and log reminder schedule times
 */
export function calculateReminderTimes(unlockAt: number): {
  twentyFourHour: Date;
  oneHour: Date;
  unlock: Date;
} {
  const unlockDate = new Date(unlockAt);
  const twentyFourHourBefore = new Date(unlockAt - 24 * 60 * 60 * 1000);
  const oneHourBefore = new Date(unlockAt - 60 * 60 * 1000);

  return {
    twentyFourHour: twentyFourHourBefore,
    oneHour: oneHourBefore,
    unlock: unlockDate,
  };
}
