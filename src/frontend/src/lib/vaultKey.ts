// Vault Key utilities

const VAULT_KEY_STORAGE_KEY = "capsuleVaultKey";

/**
 * Generate a random Vault Key in format VK-xxxxxxxx
 */
export function generateVaultKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "VK-";
  for (let i = 0; i < 8; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

/**
 * Hash a Vault Key using SHA-256
 */
export async function hashVaultKey(vaultKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(vaultKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Get the current Vault Key from localStorage, or generate a new one
 */
export function getOrCreateVaultKey(): string {
  let vaultKey = localStorage.getItem(VAULT_KEY_STORAGE_KEY);

  if (!vaultKey) {
    vaultKey = generateVaultKey();
    localStorage.setItem(VAULT_KEY_STORAGE_KEY, vaultKey);
  }

  return vaultKey;
}

/**
 * Get the current Vault Key if it exists
 */
export function getCurrentVaultKey(): string | null {
  return localStorage.getItem(VAULT_KEY_STORAGE_KEY);
}

/**
 * Get the hash of the current Vault Key
 * Returns null if no vault key exists
 */
export async function getVaultKeyHash(): Promise<string | null> {
  const vaultKey = getCurrentVaultKey();
  if (!vaultKey) {
    return null;
  }
  return await hashVaultKey(vaultKey);
}
