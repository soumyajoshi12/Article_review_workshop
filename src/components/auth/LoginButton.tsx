"use client";

import { signIn } from "../../../node_modules/next-auth/react";

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="w-full rounded-lg bg-black px-4 py-3 text-white transition hover:opacity-90"
    >
      Continue with Google
    </button>
  );
}