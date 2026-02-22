# Specification

## Summary
**Goal:** Diagnose and fix the storage initialization failure causing the "Storage temporarily offline" banner, then add /ads.txt endpoint for AdSense verification.

**Planned changes:**
- Add comprehensive diagnostic logging to storage initialization in frontend (method names, error codes, canister principals, network confirmation)
- Run automated health checks on storage system (cycles balance, network verification, canister ID bindings, ACL/auth/CORS, backend canister status)
- Apply appropriate fix based on diagnostics (top up cycles, correct canister IDs, redeploy assets, or recreate/rebind storage canister)
- Verify storage functionality with automated read/write test after fix
- Implement /ads.txt endpoint serving AdSense publisher verification content

**User-visible outcome:** The "Storage temporarily offline" banner is removed, storage operations work reliably, and the ads.txt endpoint is accessible at https://capsulevault-1ie.caffeine.xyz/ads.txt for AdSense verification.
