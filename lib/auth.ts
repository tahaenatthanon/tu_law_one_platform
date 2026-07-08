/**
 * auth.ts — Full Auth.js config (Node.js runtime)
 *
 * Re-exports authOptions from auth.config.ts for backward compatibility.
 * All provider/callback logic is now in auth.config.ts.
 *
 * Use this file for server-side auth helpers.
 */

export { authOptions } from "./auth.config";

// Re-export types for convenience
export type { NextAuthOptions } from "next-auth";
