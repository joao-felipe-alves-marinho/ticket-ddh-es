import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl items-center px-4 py-6 sm:px-6 lg:px-8">
      <section className="w-full">
        <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">Welcome</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">Sign in or create an account to continue.</p>

        <div className="mt-6 flex gap-3">
          <Link href="/login" className="inline-flex items-center rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white">
            Sign in
          </Link>
          <Link href="/register" className="inline-flex items-center rounded-full border border-[color:var(--line)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]">
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}
