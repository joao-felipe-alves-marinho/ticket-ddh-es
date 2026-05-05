"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "../../components/auth-shell";
import { loginUser, readSession, saveSession } from "../../lib/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registeredEmail = searchParams.get("email") ?? "";
  const registered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState(registeredEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (readSession()) {
      router.replace("/home");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const session = await loginUser(email, password);
      saveSession(session);
      router.replace("/home");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign in right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      badge="Login"
      title="Welcome back"
      footer={
        <p>
          New here? {" "}
          <Link className="font-semibold text-[color:var(--accent-strong)]" href="/register">
            Create an account
          </Link>
          .
        </p>
      }
    >
      {registered ? (
        <div className="mb-5 rounded-2xl border border-[color:var(--accent-soft)] bg-[color:var(--accent-soft)]/45 px-4 py-3 text-sm text-[color:var(--accent-strong)]">
          Account created. Sign in with the email you just registered.
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[color:var(--foreground)]">
            Email
          </span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            required
            className="h-12 w-full rounded-2xl border border-[color:var(--line)] bg-white/90 px-4 text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
            placeholder="alice@example.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[color:var(--foreground)]">
            Password
          </span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            className="h-12 w-full rounded-2xl border border-[color:var(--line)] bg-white/90 px-4 text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
            placeholder="Minimum 8 characters"
          />
        </label>

        {errorMessage ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[color:var(--foreground)] px-5 text-sm font-semibold text-[color:var(--surface-strong)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
