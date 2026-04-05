import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Capsule,
  CapsuleContent,
  CapsuleMetadata,
  CapsuleVerificationStatus,
  FeedbackEntry,
  Timestamp,
} from "../backend";
import {
  CapsuleType,
  type LoveCategory,
  type PredictionCategory,
} from "../backend";
import { getCurrentVaultKey, hashVaultKey } from "../lib/vaultKey";
import { useActor } from "./useActor";

// Normalize claim code: trim, uppercase, accept both hyphenated and non-hyphenated
function normalizeClaimCode(claimCode: string): string {
  const trimmed = claimCode.trim();
  const upper = trimmed.toUpperCase();

  // If it doesn't have a hyphen and starts with CAP, add the hyphen
  if (!upper.includes("-") && upper.startsWith("CAP")) {
    return `CAP-${upper.slice(3)}`;
  }

  return upper;
}

// Generate random claim code
function generateClaimCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "CAP-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate commit ID (hash)
async function generateCommitId(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content + Date.now().toString());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Generate random capsule ID
function generateCapsuleId(): string {
  return `capsule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate creation timestamp in UTC
function generateCreationTimestamp(): Timestamp {
  const now = new Date();

  // Format date as DD/MM/YYYY
  const day = String(now.getUTCDate()).padStart(2, "0");
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const year = now.getUTCFullYear();
  const date = `${day}/${month}/${year}`;

  // Format time as HH:MM:SS
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  const seconds = String(now.getUTCSeconds()).padStart(2, "0");
  const time = `${hours}:${minutes}:${seconds}`;

  return {
    date,
    time,
    timezone: "UTC",
  };
}

interface CreateCapsuleParams {
  type: "love" | "prediction";
  unlockTime: bigint;
  loveData?: {
    category: LoveCategory;
    message: string;
    note?: string;
    anonymous: boolean;
  };
  predictionData?: {
    category: PredictionCategory;
    prediction: string;
    confidence?: bigint;
    explanation?: string;
  };
}

interface SubmitFeedbackParams {
  deviceId: string;
  comment: string;
}

// Backend health check hook
export function useBackendHealth() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["backend-health"],
    queryFn: async () => {
      console.log("[DIAGNOSTIC] Health check initiated");
      console.log("[DIAGNOSTIC] Actor available:", !!actor);
      console.log("[DIAGNOSTIC] Actor fetching:", isFetching);

      if (!actor) {
        console.error("[DIAGNOSTIC] Health check failed: Actor not available");
        return false;
      }

      try {
        console.log("[DIAGNOSTIC] Calling checkHealth() method...");
        const isHealthy = await actor.checkHealth();
        console.log("[DIAGNOSTIC] Health check response:", isHealthy);

        if (isHealthy) {
          console.log("[DIAGNOSTIC] ✓ Backend storage is HEALTHY");
        } else {
          console.warn(
            "[DIAGNOSTIC] ✗ Backend storage returned unhealthy status",
          );
        }

        return isHealthy;
      } catch (error: any) {
        console.error("[DIAGNOSTIC] Health check exception:", {
          message: error.message,
          code: error.code,
          name: error.name,
          type: error.constructor.name,
        });

        // Classify error
        if (
          error.message?.includes("fetch") ||
          error.message?.includes("network")
        ) {
          console.error(
            "[DIAGNOSTIC] Health check error type: NETWORK/AGENT ERROR",
          );
        } else if (
          error.message?.includes("reject") ||
          error.message?.includes("trap")
        ) {
          console.error(
            "[DIAGNOSTIC] Health check error type: CANISTER REJECT/TRAP",
          );
        } else if (
          error.message?.includes("unauthorized") ||
          error.message?.includes("permission")
        ) {
          console.error(
            "[DIAGNOSTIC] Health check error type: PERMISSION/AUTH ERROR",
          );
        } else {
          console.error("[DIAGNOSTIC] Health check error type: UNKNOWN");
        }

        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    retryDelay: 2000,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

export function useCreateCapsule() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateCapsuleParams): Promise<Capsule> => {
      if (!actor) throw new Error("Actor not initialized");

      // Check backend health before creating capsule
      try {
        const isHealthy = await actor.checkHealth();
        if (!isHealthy) {
          throw new Error(
            "Storage temporarily offline. Please try again shortly.",
          );
        }
      } catch (_error) {
        throw new Error(
          "Storage temporarily offline. Please try again shortly.",
        );
      }

      const capsuleId = generateCapsuleId();
      const claimCode = generateClaimCode();
      const vaultKey = getCurrentVaultKey();
      const vaultKeyHash = vaultKey ? await hashVaultKey(vaultKey) : "";
      const createdAtTimestamp = generateCreationTimestamp();

      let content: CapsuleContent;

      if (params.type === "love" && params.loveData) {
        content = {
          __kind__: "loveCapsule",
          loveCapsule: {
            category: params.loveData.category,
            message: params.loveData.message,
            note: params.loveData.note,
          },
        };
      } else if (params.type === "prediction" && params.predictionData) {
        const commitId = await generateCommitId(
          params.predictionData.prediction,
        );
        content = {
          __kind__: "predictionCapsule",
          predictionCapsule: {
            category: params.predictionData.category,
            prediction: params.predictionData.prediction,
            confidence: params.predictionData.confidence,
            explanation: params.predictionData.explanation,
            commitId,
          },
        };
      } else {
        throw new Error("Invalid capsule type or missing data");
      }

      const metadata: CapsuleMetadata = {
        vaultKeyHash,
        createdAt: BigInt(Date.now() * 1_000_000),
        capsuleType:
          params.type === "love" ? CapsuleType.love : CapsuleType.prediction,
        unlockAt: params.unlockTime,
        claimCode,
        createdAtTimestamp,
      };

      // Create capsule on backend
      await actor.createCapsule(capsuleId, content, metadata);

      // Verify persistence by attempting to retrieve the capsule
      try {
        const retrievedCapsule = await actor.getCapsule(capsuleId);
        if (!retrievedCapsule) {
          throw new Error("Capsule persistence verification failed");
        }
      } catch (_error) {
        throw new Error(
          "Error saving capsule. Please try again later — storage not confirmed.",
        );
      }

      // Return the capsule object for the receipt page
      const capsule: Capsule = {
        id: capsuleId,
        content,
        metadata,
        encrypted: true,
        picture: undefined,
        creator: Principal.anonymous(),
      };

      return capsule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capsules"] });
    },
  });
}

export function useGetCapsule(claimCode: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Capsule>({
    queryKey: ["capsule", claimCode],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");

      const normalizedCode = normalizeClaimCode(claimCode);

      // Get all capsules and find by normalized claim code
      const allCapsules = await actor.getAllCapsules();
      const capsule = allCapsules.find((c) => {
        const storedCode = normalizeClaimCode(c.metadata.claimCode);
        return storedCode === normalizedCode;
      });

      if (!capsule) {
        // Log for debugging
        console.error("Capsule not found:", {
          enteredCode: claimCode,
          normalizedCode,
          availableCodes: allCapsules.map((c) => c.metadata.claimCode),
        });
        throw new Error(
          "Capsule not found in live storage. This capsule may have been created in a draft version. Please recreate it in the live app.",
        );
      }

      return capsule;
    },
    enabled: !!actor && !isFetching && !!claimCode,
    retry: false,
  });
}

export function useGetCapsulesByVaultKey(vaultKeyHash: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Capsule[]>({
    queryKey: ["capsules-by-vault-key", vaultKeyHash],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");

      if (!vaultKeyHash) {
        return [];
      }

      const capsules = await actor.getCapsulesByVaultKey(vaultKeyHash);
      return capsules;
    },
    enabled: !!actor && !isFetching && !!vaultKeyHash,
    retry: false,
  });
}

export function useCheckCapsuleExpiry(claimCode: string) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["capsule-expiry", claimCode],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");

      const normalizedCode = normalizeClaimCode(claimCode);

      // Get all capsules and find by normalized claim code
      const allCapsules = await actor.getAllCapsules();
      const capsule = allCapsules.find((c) => {
        const storedCode = normalizeClaimCode(c.metadata.claimCode);
        return storedCode === normalizedCode;
      });

      if (!capsule) {
        throw new Error("Capsule not found");
      }

      return await actor.checkCapsuleExpiry(capsule.id);
    },
    enabled: !!actor && !isFetching && !!claimCode,
    retry: false,
  });
}

export function useVerifyCapsule(claimCode: string, commitId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<CapsuleVerificationStatus>({
    queryKey: ["verify-capsule", claimCode, commitId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");

      const normalizedCode = normalizeClaimCode(claimCode);

      const result = await actor.verifyCapsule(normalizedCode, commitId);

      if (result === null) {
        // Log for debugging
        console.error("Verification failed:", {
          enteredCode: claimCode,
          normalizedCode,
          commitId,
          environment: "1ie",
        });
        throw new Error(
          "Capsule not found in live storage. This capsule may have been created in a draft version. Please recreate it in the live app.",
        );
      }

      return result;
    },
    enabled: !!actor && !isFetching && !!claimCode,
    retry: false,
  });
}

// Feedback hooks
export function useSubmitFeedback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SubmitFeedbackParams) => {
      if (!actor) throw new Error("Actor not initialized");

      const result = await actor.submitFeedback(
        params.deviceId,
        params.comment,
      );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
  });
}

export function useGetAllFeedback() {
  const { actor, isFetching } = useActor();

  return useQuery<FeedbackEntry[]>({
    queryKey: ["feedback"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");

      const feedback = await actor.getAllFeedback();
      // Sort by timestamp descending (newest first)
      return feedback.sort((a, b) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
