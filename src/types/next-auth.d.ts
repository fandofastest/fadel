import { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Menambahkan properti role, id, dan phone ke tipe User
   */
  interface User {
    id: string
    role?: string
    phone?: string
  }

  /**
   * Menambahkan properti role, id, dan phone ke session.user
   */
  interface Session {
    user: {
      id: string
      role?: string
      phone?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  /**
   * Menambahkan properti role, id, dan phone ke token JWT
   */
  interface JWT {
    id?: string
    role?: string
    phone?: string
  }
}
