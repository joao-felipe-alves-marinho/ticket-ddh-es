"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "../../components/auth-shell";
import { registerUser, readSession } from "../../lib/auth";

const roles = ["reporter", "agent", "manager"] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]>("reporter");
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
      await registerUser({ name, email, password, role });
      router.replace(`/login?registered=1&email=${encodeURIComponent(email)}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create the account right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      badge="Register"
      title="Create an account"
      footer={
        <p>
          Already have an account? {" "}
          <Link className="font-semibold text-[color:var(--accent-strong)]" href="/login">
            Sign in
          </Link>
          .
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[color:var(--foreground)]">
            Full name
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            type="text"
            autoComplete="name"
            required
            minLength={2}
            className="h-12 w-full rounded-2xl border border-[color:var(--line)] bg-white/90 px-4 text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
            placeholder="Alice Doe"
          />
        </label>

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
            autoComplete="new-password"
            required
            minLength={8}
            className="h-12 w-full rounded-2xl border border-[color:var(--line)] bg-white/90 px-4 text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
            placeholder="Minimum 8 characters"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[color:var(--foreground)]">
            Role
          </span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as (typeof roles)[number])}
            className="h-12 w-full rounded-2xl border border-[color:var(--line)] bg-white/90 px-4 text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
          >
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
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
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
