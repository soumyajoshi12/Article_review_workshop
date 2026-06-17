"use client";

import { signOut } from "../../../node_modules/next-auth/react";

export default function LogoutButton() {
  const handleLogout = () => {
    sessionStorage.clear();
    signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded bg-red-500 px-4 py-2 text-white"
    >
      Logout
    </button>
  );
}