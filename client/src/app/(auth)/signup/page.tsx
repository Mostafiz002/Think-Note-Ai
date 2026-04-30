"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { AtSignIcon, KeyIcon, LockIcon, UserIcon } from "lucide-react";
import { AuthPage } from "@/components/common/auth-page";

export default function SignupPage() {
  const router = useRouter();

  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [stage, setStage] = React.useState<"signup" | "otp">("signup");
  const [emailForOtp, setEmailForOtp] = React.useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const form = new FormData(e.currentTarget);
      const name = String(form.get("name") ?? "");
      const email = String(form.get("email") ?? "");
      const password = String(form.get("password") ?? "");

      await apiFetch("/api/auth/register", {
        method: "POST",
        body: { name, email, password },
      });

      toast.success("Code sent! Check your inbox.");
      setEmailForOtp(email);
      setStage("otp");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setPending(false);
    }
  }

  async function onVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const form = new FormData(e.currentTarget);
      const otp = String(form.get("otp") ?? "");

      await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        body: { email: emailForOtp, otp },
      });

      toast.success("Welcome aboard!");
      router.replace("/app");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setPending(false);
    }
  }
  async function onResendOtp() {
    setError(null);
    setPending(true);
    try {
      await apiFetch("/api/auth/resend-otp", {
        method: "POST",
        body: { email: emailForOtp },
      });
      toast.success("New code sent!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Resend failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPage
      title={stage === "signup" ? "Create your workspace" : "Verify your email"}
      description={
        stage === "signup"
          ? "We’ll send a one-time code to verify your email."
          : `Enter the code we sent to ${emailForOtp}.`
      }
    >
      {stage === "signup" ? (
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <InputGroup>
              <InputGroupInput
                id="name"
                name="name"
                autoComplete="name"
                placeholder="John Doe"
                required
              />
              <InputGroupAddon align="inline-start">
                <UserIcon className="size-4" />
              </InputGroupAddon>
            </InputGroup>
          </div>
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
                autoComplete="new-password"
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
            {pending ? "Sending code..." : "Create account"}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link
              className="text-foreground underline underline-offset-4"
              href="/login"
            >
              Sign in
            </Link>
            .
          </p>
        </form>
      ) : (
        <form onSubmit={onVerifyOtp} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="otp">Verification code</Label>
            <InputGroup>
              <InputGroupInput
                id="otp"
                name="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                required
              />
              <InputGroupAddon align="inline-start">
                <KeyIcon className="size-4" />
              </InputGroupAddon>
            </InputGroup>
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button className="w-full" type="submit" disabled={pending}>
            {pending ? "Verifying..." : "Verify & continue"}
          </Button>

          <div className="flex items-center justify-between">
            <button
              type="button"
              className="text-sm text-muted-foreground underline underline-offset-4"
              onClick={() => setStage("signup")}
            >
              Use a different email
            </button>
            <button
              type="button"
              className="text-sm text-muted-foreground underline underline-offset-4"
              onClick={onResendOtp}
              disabled={pending}
            >
              Resend code
            </button>
          </div>
        </form>
      )}
    </AuthPage>
  );
}
