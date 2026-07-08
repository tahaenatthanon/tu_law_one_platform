import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Fallback NEXTAUTH_URL from Vercel-provided VERCEL_URL when not set
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
	process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
