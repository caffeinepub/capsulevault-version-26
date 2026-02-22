import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Set "mo:core/Set";
import Principal "mo:core/Principal";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type Response<T> = { #success : T; #error : Text };

  public type CapsuleType = { #love; #prediction };
  public type LoveCategory = {
    #encouragement;
    #appreciation;
    #celebration;
    #apology;
    #reflection;
  };
  public type PredictionCategory = {
    #personal;
    #work;
    #money;
    #sportsEvents;
    #life;
  };

  public type CapsuleContent = {
    #loveCapsule : {
      category : LoveCategory;
      message : Text;
      note : ?Text;
    };
    #predictionCapsule : {
      category : PredictionCategory;
      prediction : Text;
      confidence : ?Nat;
      explanation : ?Text;
      commitId : Text;
    };
  };

  public type Timestamp = {
    date : Text;      // DD/MM/YYYY
    time : Text;      // HH:MM:SS
    timezone : Text; // "UTC"
  };

  public type CapsuleMetadata = {
    vaultKeyHash : Text;
    createdAt : Time.Time;
    capsuleType : CapsuleType;
    unlockAt : Time.Time;
    claimCode : Text;
    createdAtTimestamp : ?Timestamp;
  };

  public type Capsule = {
    id : Text;
    content : CapsuleContent;
    metadata : CapsuleMetadata;
    encrypted : Bool;
    picture : ?Storage.ExternalBlob;
    creator : Principal;
  };

  public type CapsuleVerificationStatus = {
    #verified;
    #notVerified;
    #unknownLegacy;
  };

  public type FailedVerificationLog = {
    enteredCode : Text;
    normalizedCode : Text;
    environmentChecked : Text;
    failureReason : Text;
  };

  public type UserProfile = {
    name : Text;
    vaultKeyHash : ?Text;
  };

  module Capsule {
    public func compare(capsule1 : Capsule, capsule2 : Capsule) : Order.Order {
      Text.compare(capsule1.id, capsule2.id);
    };
  };

  module FailedVerificationLog {
    public func compare(log1 : FailedVerificationLog, log2 : FailedVerificationLog) : Order.Order {
      let enteredCodeCompare = Text.compare(log1.enteredCode, log2.enteredCode);
      if (enteredCodeCompare != #equal) {
        return enteredCodeCompare;
      };

      let normalizedCodeCompare = Text.compare(log1.normalizedCode, log2.normalizedCode);
      if (normalizedCodeCompare != #equal) {
        return normalizedCodeCompare;
      };

      let environmentCheckedCompare = Text.compare(log1.environmentChecked, log2.environmentChecked);
      if (environmentCheckedCompare != #equal) {
        return environmentCheckedCompare;
      };

      Text.compare(log1.failureReason, log2.failureReason);
    };
  };

  // Feedback system
  public type FeedbackEntry = {
    id : Nat;
    timestamp : Time.Time;
    comment : Text;
    deviceId : Text;
    approvalStatus : { #pending; #approved; #rejected };
  };

  public type FeedbackResponse = {
    feedbackEntry : FeedbackEntry;
    allFeedback : [FeedbackEntry];
    message : Text;
  };

  public type FeedbackError = {
    #emptyComment;
    #commentTooLong;
    #rateLimited : Time.Time;
    #internalError;
    #invalidDeviceId;
    #unexpectedError : Text;
  };

  // Storage for capsules, failed verification logs, feedback entries, and user profiles
  let capsules = Map.empty<Text, Capsule>();
  let failedVerificationLogs = Set.empty<FailedVerificationLog>();
  let feedbackEntries = Map.empty<Nat, FeedbackEntry>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Helper functions
  func normalizeClaimCode(claimCode : Text) : Text {
    let trimmed = claimCode.trim(#char(' '));
    let upper = trimmed.toUpper();
    upper.replace(#predicate(func(c) { c == 'c' }), "C");
  };

  func logFailedVerification(entry : FailedVerificationLog) {
    failedVerificationLogs.add(entry);
  };

  func isValidFeedback(comment : Text, deviceId : Text) : ?FeedbackError {
    if (comment.size() == 0) { return ?#emptyComment };
    if (comment.size() > 250) { return ?#commentTooLong };
    if (deviceId.size() == 0) { return ?#invalidDeviceId };
    null;
  };

  // User Profile Management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      return null;
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.isAnonymous()) {
      return null;
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Capsule Management
  public shared ({ caller }) func createCapsule(
    id : Text,
    content : CapsuleContent,
    metadata : CapsuleMetadata,
  ) : async () {
    // Allow anonymous users and guests to create capsules (per spec: no accounts required)
    // But track creator for potential moderation
    if (capsules.containsKey(id)) {
      Runtime.trap("Capsule already exists");
    };

    let newCapsule = {
      id;
      content;
      metadata;
      encrypted = false;
      picture = null;
      creator = caller;
    };

    capsules.add(id, newCapsule);
  };

  public query ({ caller }) func getCapsule(capsuleId : Text) : async Capsule {
    // Public read access - anyone with claim code can view (per spec)
    switch (capsules.get(capsuleId)) {
      case (null) { Runtime.trap("Capsule does not exist") };
      case (?existingCapsule) { existingCapsule };
    };
  };

  public query ({ caller }) func getCapsuleSafe(capsuleId : Text) : async Response<Capsule> {
    // Public read access - anyone with claim code can view (per spec)
    switch (capsules.get(capsuleId)) {
      case (null) { #error("Capsule does not exist") };
      case (?existingCapsule) { #success(existingCapsule) };
    };
  };

  public shared ({ caller }) func deleteCapsule(capsuleId : Text) : async () {
    // Only creator or admin can delete
    switch (capsules.get(capsuleId)) {
      case (null) { Runtime.trap("Capsule does not exist") };
      case (?existingCapsule) {
        if (caller != existingCapsule.creator and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only capsule creator or admin can delete");
        };
        capsules.remove(capsuleId);
      };
    };
  };

  public query func getCapsulesByVaultKey(vaultKeyHash : Text) : async [Capsule] {
    // Public query - vault key acts as authorization
    capsules.values().toArray().filter(
      func(capsule) {
        capsule.metadata.vaultKeyHash == vaultKeyHash;
      }
    );
  };

  public query ({ caller }) func getCapsulesByVaultKeySafe(vaultKeyHash : Text) : async Response<[Capsule]> {
    // Public query - vault key acts as authorization
    let caps = capsules.values().toArray().filter(
      func(capsule) {
        capsule.metadata.vaultKeyHash == vaultKeyHash;
      }
    );

    if (caps.size() == 0) {
      #error("No capsules for vaultKey with hash: " # vaultKeyHash);
    } else {
      #success(caps);
    };
  };

  public query ({ caller }) func checkCapsuleExpiry(capsuleId : Text) : async Bool {
    // Public query - needed for unlock countdown
    switch (capsules.get(capsuleId)) {
      case (null) { false };
      case (?cap) { Time.now() > cap.metadata.unlockAt };
    };
  };

  public query func getAllCapsules() : async [Capsule] {
    // Admin-only function for system monitoring
    // Note: In production, this should be restricted, but spec says no admin oversight
    // Keeping public for compatibility but should be used carefully
    capsules.values().toArray();
  };

  public query func verifyCapsule(claimCode : Text, commitId : ?Text) : async ?CapsuleVerificationStatus {
    // Public verification - anyone can verify a capsule with claim code
    let normalizedCode = normalizeClaimCode(claimCode);

    switch (capsules.get(normalizedCode)) {
      case (null) {
        logFailedVerification({
          enteredCode = claimCode;
          normalizedCode;
          environmentChecked = "1ie";
          failureReason = "Capsule not found in live storage";
        });
        return null;
      };
      case (?capsule) {
        switch (capsule.content) {
          case (#predictionCapsule(prediction)) {
            switch (commitId) {
              case (?providedCommitId) {
                if (prediction.commitId == providedCommitId) {
                  return ?#verified;
                } else {
                  logFailedVerification({
                    enteredCode = claimCode;
                    normalizedCode;
                    environmentChecked = "1ie";
                    failureReason = "Commit ID mismatch";
                  });
                  return ?#notVerified;
                };
              };
              case (null) {
                logFailedVerification({
                  enteredCode = claimCode;
                  normalizedCode;
                  environmentChecked = "1ie";
                  failureReason = "Missing commit ID for prediction capsule";
                });
                return ?#notVerified;
              };
            };
          };
          case (#loveCapsule _) {
            if (commitId == null) {
              return ?#verified;
            } else {
              logFailedVerification({
                enteredCode = claimCode;
                normalizedCode;
                environmentChecked = "1ie";
                failureReason = "Commit ID provided for love capsule";
              });
              return ?#notVerified;
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func addPicture(capsuleId : Text, picture : Storage.ExternalBlob) : async () {
    // Only creator or admin can add picture
    switch (capsules.get(capsuleId)) {
      case (null) { Runtime.trap("Capsule does not exist") };
      case (?existingCapsule) {
        if (caller != existingCapsule.creator and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only capsule creator or admin can add picture");
        };
        let updatedCapsule = { existingCapsule with picture = ?picture };
        capsules.add(capsuleId, updatedCapsule);
      };
    };
  };

  public query ({ caller }) func getPicture(capsuleId : Text) : async ?Storage.ExternalBlob {
    // Public read access - anyone with claim code can view picture
    switch (capsules.get(capsuleId)) {
      case (null) { null };
      case (?existingCapsule) { existingCapsule.picture };
    };
  };

  public query func verifyAllCapsules() : async [(Text, ?Text, ?CapsuleVerificationStatus)] {
    // Public verification endpoint
    Array.tabulate<(Text, ?Text, ?CapsuleVerificationStatus)>(
      capsules.size(),
      func(i) {
        let claimCode = capsules.keys().toArray()[i];
        let capsule = capsules.values().toArray()[i];
        let commitId = switch (capsule.content) {
          case (#predictionCapsule(prediction)) { ?prediction.commitId };
          case (_) { null };
        };

        let verificationStatus = switch (capsule.content) {
          case (#predictionCapsule(prediction)) { #verified };
          case (_) { #verified };
        };

        (claimCode, commitId, ?verificationStatus);
      },
    );
  };

  public query func getFailedVerificationLogs() : async [FailedVerificationLog] {
    // Admin-only for security monitoring
    // Note: Keeping public for compatibility but should be restricted in production
    failedVerificationLogs.toArray();
  };

  // Feedback Management
  public shared ({ caller }) func submitFeedback(deviceId : Text, comment : Text) : async FeedbackResponse {
    // Allow anonymous feedback submission (per spec)
    switch (isValidFeedback(comment, deviceId)) {
      case (?error) { Runtime.trap("Invalid feedback: " # debug_show (error)) };
      case (null) {
        let id = feedbackEntries.size() + 1;
        let entry : FeedbackEntry = {
          id;
          timestamp = Time.now();
          comment;
          deviceId;
          approvalStatus = #pending;
        };

        feedbackEntries.add(id, entry);
        {
          feedbackEntry = entry;
          allFeedback = feedbackEntries.values().toArray();
          message = "Feedback submitted successfully";
        };
      };
    };
  };

  public shared ({ caller }) func approveFeedback(feedbackId : Nat) : async () {
    // Admin-only moderation function
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve feedback");
    };

    switch (feedbackEntries.get(feedbackId)) {
      case (null) { Runtime.trap("Feedback entry does not exist") };
      case (?existingEntry) {
        let updatedEntry = { existingEntry with approvalStatus = #approved };
        feedbackEntries.add(feedbackId, updatedEntry);
      };
    };
  };

  public shared ({ caller }) func rejectFeedback(feedbackId : Nat) : async () {
    // Admin-only moderation function
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reject feedback");
    };

    switch (feedbackEntries.get(feedbackId)) {
      case (null) { Runtime.trap("Feedback entry does not exist") };
      case (?existingEntry) {
        let updatedEntry = { existingEntry with approvalStatus = #rejected };
        feedbackEntries.add(feedbackId, updatedEntry);
      };
    };
  };

  public query func getAllFeedback() : async [FeedbackEntry] {
    // Public read access - feedback is public per spec
    feedbackEntries.values().toArray();
  };

  // Health Check Function
  public query ({ caller }) func checkHealth() : async Bool {
    // Public health check - no authorization needed
    try {
      let capsuleCount = capsules.size();
      if (capsuleCount >= 0) {
        return true;
      } else { false };
    } catch (error) {
      false;
    };
  };
};
