import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // refresh every 24h
  },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
    error: "/auth/login",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
      }),
    ] : []),
    ...(process.env.GITHUB_CLIENT_ID ? [
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
      }),
    ] : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user || !user.hashedPassword) {
          throw new Error("No account found with this email");
        }
        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!isValid) throw new Error("Incorrect password");
        return user;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Auto-create workspace for new OAuth users
      if (account?.provider !== "credentials" && user.email) {
        try {
          // 1. LOOKUP THE REAL DB USER BY EMAIL
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          });

          // 2. USE THE REAL MONGODB ID (dbUser.id)
          if (dbUser) {
            const existing = await prisma.workspaceMember.findFirst({
              where: { userId: dbUser.id }, 
            });
            
            if (!existing) {
              const name = dbUser.name || dbUser.email?.split("@")[0] || "My";
              let slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-workspace`;
              const existingSlug = await prisma.workspace.findUnique({ where: { slug } });
              if (existingSlug) slug = `${slug}-${Date.now()}`;
              
              await prisma.workspace.create({
                data: {
                  name: `${name}'s Workspace`,
                  slug,
                  members: { create: { userId: dbUser.id, role: "OWNER" } },
                },
              });
            }
          }
        } catch (e) { 
          console.error("Workspace auto-create error:", e); 
        }
      }
      return true; // Always return true so login doesn't crash
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = (user as any).image;
        token.role = (user as any).role;
        token.lastActive = Date.now();
      }
      // Session update trigger
      if (trigger === "update" && session) {
        token.lastActive = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).image = token.image;
        (session.user as any).role = token.role;
        (session.user as any).lastActive = token.lastActive;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // NextAuth events fire immediately after a user is added to DB via Prisma Adapter
      // At this point, user.id is a guaranteed valid MongoDB ID!
      try {
        let slug = `${(user.name || "my").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-workspace`;
        const existing = await prisma.workspace.findUnique({ where: { slug } });
        if (existing) slug = `${slug}-${Date.now()}`;
        
        await prisma.workspace.create({
          data: {
            name: `${user.name || "My"}'s Workspace`,
            slug,
            members: { create: { userId: user.id, role: "OWNER" } },
          },
        });
      } catch (e) { 
        console.error("Auto workspace error:", e); 
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};