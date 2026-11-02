import { requireRole } from "@/lib/auth";

export default async function GuestPage() {
  await requireRole("guest");

  return (
    <main className="p-10 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Guest Page 👀</h1>

      <p className="text-gray-400 mb-4">
        You are browsing as a guest. Create an account to unlock full features.
      </p>

      <a
        href="/signup"
        className="bg-green-600 px-4 py-2 rounded inline-block"
      >
        Sign Up
      </a>
    </main>
  );
}