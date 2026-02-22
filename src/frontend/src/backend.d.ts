import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Capsule {
    id: string;
    creator: Principal;
    content: CapsuleContent;
    metadata: CapsuleMetadata;
    encrypted: boolean;
    picture?: ExternalBlob;
}
export interface Timestamp {
    timezone: string;
    date: string;
    time: string;
}
export type Time = bigint;
export type CapsuleContent = {
    __kind__: "predictionCapsule";
    predictionCapsule: {
        prediction: string;
        explanation?: string;
        category: PredictionCategory;
        commitId: string;
        confidence?: bigint;
    };
} | {
    __kind__: "loveCapsule";
    loveCapsule: {
        note?: string;
        message: string;
        category: LoveCategory;
    };
};
export interface FailedVerificationLog {
    failureReason: string;
    enteredCode: string;
    normalizedCode: string;
    environmentChecked: string;
}
export interface FeedbackEntry {
    id: bigint;
    approvalStatus: Variant_pending_approved_rejected;
    comment: string;
    deviceId: string;
    timestamp: Time;
}
export interface FeedbackResponse {
    allFeedback: Array<FeedbackEntry>;
    message: string;
    feedbackEntry: FeedbackEntry;
}
export interface CapsuleMetadata {
    createdAtTimestamp?: Timestamp;
    capsuleType: CapsuleType;
    createdAt: Time;
    vaultKeyHash: string;
    unlockAt: Time;
    claimCode: string;
}
export type Response_1 = {
    __kind__: "error";
    error: string;
} | {
    __kind__: "success";
    success: Capsule;
};
export type Response = {
    __kind__: "error";
    error: string;
} | {
    __kind__: "success";
    success: Array<Capsule>;
};
export interface UserProfile {
    name: string;
    vaultKeyHash?: string;
}
export enum CapsuleType {
    prediction = "prediction",
    love = "love"
}
export enum CapsuleVerificationStatus {
    verified = "verified",
    notVerified = "notVerified",
    unknownLegacy = "unknownLegacy"
}
export enum LoveCategory {
    appreciation = "appreciation",
    encouragement = "encouragement",
    apology = "apology",
    reflection = "reflection",
    celebration = "celebration"
}
export enum PredictionCategory {
    money = "money",
    life = "life",
    work = "work",
    personal = "personal",
    sportsEvents = "sportsEvents"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_approved_rejected {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    addPicture(capsuleId: string, picture: ExternalBlob): Promise<void>;
    approveFeedback(feedbackId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkCapsuleExpiry(capsuleId: string): Promise<boolean>;
    checkHealth(): Promise<boolean>;
    createCapsule(id: string, content: CapsuleContent, metadata: CapsuleMetadata): Promise<void>;
    deleteCapsule(capsuleId: string): Promise<void>;
    getAllCapsules(): Promise<Array<Capsule>>;
    getAllFeedback(): Promise<Array<FeedbackEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCapsule(capsuleId: string): Promise<Capsule>;
    getCapsuleSafe(capsuleId: string): Promise<Response_1>;
    getCapsulesByVaultKey(vaultKeyHash: string): Promise<Array<Capsule>>;
    getCapsulesByVaultKeySafe(vaultKeyHash: string): Promise<Response>;
    getFailedVerificationLogs(): Promise<Array<FailedVerificationLog>>;
    getPicture(capsuleId: string): Promise<ExternalBlob | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    rejectFeedback(feedbackId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitFeedback(deviceId: string, comment: string): Promise<FeedbackResponse>;
    verifyAllCapsules(): Promise<Array<[string, string | null, CapsuleVerificationStatus | null]>>;
    verifyCapsule(claimCode: string, commitId: string | null): Promise<CapsuleVerificationStatus | null>;
}
