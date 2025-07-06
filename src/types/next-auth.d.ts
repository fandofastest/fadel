import { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Menambahkan properti role dan id ke tipe User
   */
  interface User {
    id: string
    role?: string
  }

  /**
   * Menambahkan properti role dan id ke session.user
   */
  interface Session {
    user: {
      id: string
      role?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  /**
   * Menambahkan properti role dan id ke token JWT
   */
  interface JWT {
    id?: string
    role?: string
  }
}
