"use client";
import { SessionProvider } from "next-auth/react";

// wraps app with session provider for authentication
export default function SessionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}