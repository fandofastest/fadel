import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const nextAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password harus diisi");
        }

        try {
          await dbConnect();
          const user = await User.findOne({ email: credentials.email });
          
          if (!user) {
            throw new Error("Email atau password salah");
          }
          
          // Pastikan passwordHash ada sebelum melakukan compare (field di model adalah passwordHash, bukan password)
          if (!user.passwordHash) {
            console.error("PasswordHash tidak ditemukan untuk user:", user.email);
            throw new Error("Data pengguna tidak valid");
          }

          // Gunakan passwordHash sesuai dengan model User
          const isPasswordValid = await compare(credentials.password, user.passwordHash);
          
          if (!isPasswordValid) {
            throw new Error("Email atau password salah");
          }

          // Log informasi pengguna untuk debugging
          console.log("User authenticated:", { 
            id: user._id.toString(),
            email: user.email, 
            role: user.role 
          });
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error("Terjadi kesalahan saat mencoba masuk");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 jam
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
