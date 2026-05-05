import type { ReactNode } from "react";

type AuthShellProps = {
  badge: string;
  title: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthShell({ badge, title, children, footer }: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl items-center px-4 py-6 sm:px-6 lg:px-8">
      <section className="w-full">
        <header className="mb-6">
          <p className="inline-flex items-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
            {badge}
          </p>
          <h1
            className="mt-4 text-3xl leading-tight text-[color:var(--foreground)]"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            {title}
          </h1>
        </header>

        <section className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow)]">
          {children}

          <div className="mt-6 border-t border-[color:var(--line)] pt-4 text-sm leading-6 text-[color:var(--muted)]">
            {footer}
          </div>
        </section>
      </section>
    </main>
  );
}
