"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "./button";

export default function SignOutButton() {
  return (
    <Button
      variant="ghost"
      onClick={() => signOut()}
    >
      <LogOut className="md:hidden" />
      <span className="hidden md:block">Sign out</span>
    </Button>
  );
}
