"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess?: (user: { id: string; email: string; name: string }) => void;
}

export function AuthModal({ open, onOpenChange, onAuthSuccess }: AuthModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setEmail("");
    setName("");
    setPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (tab === "register" && !name.trim()) return;

    setLoading(true);
    try {
      const endpoint = tab === "register" ? "/api/auth/register" : "/api/auth/login";
      const body =
        tab === "register"
          ? { email: email.trim(), name: name.trim(), password }
          : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || (tab === "register" ? "Registration failed" : "Sign in failed"));
        return;
      }

      onAuthSuccess?.(data.user);
      toast.success(tab === "register" ? "Account created! Welcome!" : "Welcome back!");
      onOpenChange(false);
      resetForm();
      router.refresh();
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {tab === "register" ? "Create Account" : "Sign In"}
          </DialogTitle>
          <DialogDescription className="text-text-sub">
            {tab === "register"
              ? "Register to start making predictions"
              : "Sign in to your account"}
          </DialogDescription>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-secondary p-1 gap-1">
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
              tab === "register"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
              tab === "login"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {tab === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                autoComplete="name"
                disabled={loading}
                className="bg-secondary border-border focus:border-primary"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
              className="bg-secondary border-border focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder={tab === "register" ? "Min. 6 characters" : "Your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={tab === "register" ? "new-password" : "current-password"}
              disabled={loading}
              className="bg-secondary border-border focus:border-primary"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {tab === "register" ? "Creating account..." : "Signing in..."}
              </span>
            ) : tab === "register" ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
