"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthPage } from "@/components/common/auth-page";
import { AtSignIcon, LockIcon } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/app";

  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const form = new FormData(e.currentTarget);
      const email = String(form.get("email") ?? "");
      const password = String(form.get("password") ?? "");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(data?.message ?? "Login failed");
      }

      toast.success("Welcome back!");
      router.replace(next);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPage
      title="Welcome back"
      description="Sign in to your notes workspace."
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <InputGroup>
            <InputGroupInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="your.email@example.com"
              required
            />
            <InputGroupAddon align="inline-start">
              <AtSignIcon className="size-4" />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <InputGroup>
            <InputGroupInput
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
            <InputGroupAddon align="inline-start">
              <LockIcon className="size-4" />
            </InputGroupAddon>
          </InputGroup>
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <Button className="w-full" type="submit" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          New here?{" "}
          <Link
            className="text-foreground underline underline-offset-4"
            href="/signup"
          >
            Create an account
          </Link>
          .
        </p>
      </form>
    </AuthPage>
  );
}
