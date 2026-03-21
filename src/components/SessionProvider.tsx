"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

const devSession = {
  user: {
    id: "dev-user",
    name: "Dev User",
    email: "dev@officialai.local",
    industry: "technology",
    plan: "authority",
    onboarded: true,
  },
  expires: "2099-12-31T23:59:59.999Z",
};

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const isDev = process.env.NODE_ENV !== "production";
  return (
    <NextAuthSessionProvider session={isDev ? (devSession as any) : undefined}>
      {children}
    </NextAuthSessionProvider>
  );
}
