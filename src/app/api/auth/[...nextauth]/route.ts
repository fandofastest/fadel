import NextAuth from "next-auth";
import { nextAuthOptions } from "./options";

// Menggunakan konfigurasi NextAuth dari options.ts
const handler = NextAuth(nextAuthOptions);

export { handler as GET, handler as POST };
