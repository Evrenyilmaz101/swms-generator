// Token generation and validation utilities

export function generateToken(): string {
  // Generate a URL-safe random token
  const array = new Uint8Array(24);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without Web Crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function isValidToken(token: string): boolean {
  return /^[a-f0-9]{48}$/.test(token);
}
