"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Field, describedBy } from "@/components/app/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, signUp } from "@/server/actions/auth";

type Mode = "sign-in" | "sign-up";

const PASSWORD_MIN = 10;

export function AuthForm({ mode }: { mode: Mode }) {
  const isSignUp = mode === "sign-up";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    setPending(true);

    try {
      const result = isSignUp
        ? await signUp({ name, email, password })
        : await signIn({ email, password });

      if (result.ok) {
        // A hard navigation, not router.push: the session cookie was just set
        // and the client router still holds a cached unauthenticated render of
        // the destination. This guarantees the server sees the new session.
        window.location.assign("/dashboard");
        return;
      }

      setErrors({ form: result.error });
    } catch {
      // The action itself failed to complete — a dropped connection, a rate
      // limit, or a server error. Without this the button would sit on
      // "Creating account…" indefinitely and explain nothing.
      setErrors({
        form: isSignUp
          ? "The server didn't respond, so the account was not created. Check that the app is running and the database is set up, then try again."
          : "The server didn't respond, so you are not signed in. Check that the app is running, then try again.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-[-0.02em]">
          {isSignUp ? "Create your account" : "Sign in"}
        </h1>
        <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">
          {isSignUp
            ? "You'll pick whether you're the freelancer or the client next."
            : "Welcome back."}
        </p>
      </div>

      {errors.form ? (
        <p
          role="alert"
          className="mb-4 rounded-md border border-negative/40 bg-negative/5 px-3 py-2.5 text-[12px] leading-5 text-negative"
        >
          {errors.form}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-4">
        {isSignUp ? (
          <Field label="Name" htmlFor="auth-name" error={errors.name}>
            <Input
              id="auth-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Alex Moreau"
              autoComplete="name"
              maxLength={120}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describedBy("auth-name", errors.name)}
            />
          </Field>
        ) : null}

        <Field label="Email" htmlFor="auth-email" error={errors.email}>
          <Input
            id="auth-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@studio.com"
            autoComplete="email"
            maxLength={255}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("auth-email", errors.email)}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="auth-password"
          error={errors.password}
          hint={
            isSignUp
              ? `At least ${PASSWORD_MIN} characters. A long passphrase beats a short complicated one.`
              : undefined
          }
        >
          <div className="relative">
            <Input
              id="auth-password"
              type={reveal ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              maxLength={200}
              className="pr-11"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={describedBy("auth-password", errors.password, isSignUp ? "hint" : undefined)}
            />
            <button
              type="button"
              onClick={() => setReveal((value) => !value)}
              aria-label={reveal ? "Hide password" : "Show password"}
              className="absolute right-0 top-0 grid size-9 place-items-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground"
            >
              {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <Button type="submit" disabled={pending} className="mt-1 w-full gap-2">
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending
            ? isSignUp
              ? "Creating account…"
              : "Signing in…"
            : isSignUp
              ? "Create account"
              : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-[13px] text-muted-foreground">
        {isSignUp ? "Already have an account? " : "New here? "}
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className="font-medium text-signal hover:underline"
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>

      <p className="mt-6 border-t border-border pt-4 text-[11px] leading-5 text-muted-foreground">
        Passwords are hashed with scrypt before they are stored, and sessions are
        server-side. There is no email verification or password reset yet, because
        neither is possible without an email provider.
      </p>
    </div>
  );
}
