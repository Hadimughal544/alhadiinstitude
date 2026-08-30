import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { dashboardPathForRole, pathMatchesPrefix } from "@/lib/roles";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: () => null,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const role = auth?.user?.role;
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      if (pathname.startsWith("/login") && isLoggedIn) {
        return Response.redirect(new URL(dashboardPathForRole(role), nextUrl));
      }

      if (pathMatchesPrefix(pathname, "/admin")) {
        if (role === "ADMIN") return true;
        if (isLoggedIn) {
          return Response.redirect(new URL(dashboardPathForRole(role), nextUrl));
        }
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(loginUrl);
      }

      if (pathMatchesPrefix(pathname, "/teacher")) {
        if (role === "TEACHER") return true;
        if (isLoggedIn) {
          return Response.redirect(new URL(dashboardPathForRole(role), nextUrl));
        }
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(loginUrl);
      }

      if (pathMatchesPrefix(pathname, "/student")) {
        if (role === "STUDENT") return true;
        if (isLoggedIn) {
          return Response.redirect(new URL(dashboardPathForRole(role), nextUrl));
        }
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(loginUrl);
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as typeof session.user.role;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
};
