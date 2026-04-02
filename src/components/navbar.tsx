"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut } from "lucide-react";
import type { UserData } from "@/lib/types";
import { toast } from "sonner";

interface NavbarProps {
  user: UserData | null;
  onSignIn: () => void;
}

export function Navbar({ user, onSignIn }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.refresh();
  }

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/fifa-wc-2026.png"
              alt=""
              width={22}
              height={34}
              className="opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <span className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">
              PREDICT<span className="text-primary">.</span>MATCH
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm text-text-sub hover:text-primary transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <div className="w-px h-4 bg-border" />
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold sm:hidden">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-primary transition-colors p-1"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </>
            ) : (
              <Button
                onClick={onSignIn}
                size="sm"
                className="text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
