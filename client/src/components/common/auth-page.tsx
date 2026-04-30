"use client";

import type React from "react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { FloatingPaths } from "@/components/common/floating-paths";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AuthPageProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthPage({ title, description, children }: AuthPageProps) {
  const pathname = usePathname();

  const isLogin = pathname === "/login";
  const text = isLogin ? "Signup" : "Signin";
  const route = isLogin ? "/signup" : "/login";

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      <div className="relative hidden h-full flex-col border-r bg-secondary p-10 lg:flex dark:bg-secondary/20">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
        <h2 className="mr-auto text-lg font-bold tracking-tight">
            Think Note AI.
        </h2>

        <div className="z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl">
              &ldquo;Think Note AI has completely transformed how I organize my
              thoughts. It's like having a second brain that never
              forgets.&rdquo;
            </p>
            <footer className="font-mono font-semibold text-sm">
              ~ Mostafizur Rahman
            </footer>
          </blockquote>
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>
      <div className="relative flex min-h-screen flex-col justify-center px-8">
        {/* Top Shades */}
        <div
          aria-hidden
          className="absolute inset-0 isolate -z-10 opacity-60 contain-strict pointer-events-none"
        >
          <div className="absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]" />
          <div className="absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]" />
        </div>
        <Button asChild className="absolute top-7 left-5" variant="ghost">
          <Link href={route}>
            <ChevronLeftIcon className="mr-2 h-4 w-4" />
            {text}
          </Link>
        </Button>

        <div className="mx-auto space-y-4 sm:w-sm">
          <Logo className="h-4.5 lg:hidden mb-8" />
          <div className="flex flex-col space-y-1">
            <h1 className="font-bold text-2xl tracking-wide">{title}</h1>
            <p className="text-base text-muted-foreground">{description}</p>
          </div>

          {children}

          <p className="mt-8 text-muted-foreground text-sm">
            By clicking continue, you agree to our{" "}
            <a
              className="underline underline-offset-4 hover:text-primary"
              href="#"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              className="underline underline-offset-4 hover:text-primary"
              href="#"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
