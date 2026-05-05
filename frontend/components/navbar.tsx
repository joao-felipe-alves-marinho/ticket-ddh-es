"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { clearSession, type SessionUser } from "../lib/auth";

type NavbarProps = {
  session: SessionUser;
};

export function Navbar({ session }: NavbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  function handleLogout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <nav className="border-b border-[color:var(--line)] bg-[color:var(--surface)] shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/home" className="flex items-center gap-2 text-lg font-semibold text-[color:var(--foreground)]">
          <svg className="h-6 w-6 text-[color:var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9-4 9 4m-9 4v10" />
          </svg>
          IssueFlow
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="cursor-pointer flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-3 py-2 text-sm font-semibold text-white shadow-md transition duration-200 hover:bg-[color:var(--accent-strong)] hover:shadow-lg active:scale-95"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span className="max-w-[100px] truncate">{session.name}</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] shadow-lg">
              <div className="border-b border-[color:var(--line)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">Account</p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">{session.name}</p>
                <p className="text-xs text-[color:var(--muted)]">{session.email}</p>
              </div>

              <div className="px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">Role</p>
                <p className="mt-1 inline-flex rounded-full bg-[color:var(--accent-soft)] px-2 py-1 text-xs font-semibold text-[color:var(--accent-strong)]">
                  {session.role}
                </p>
              </div>

              <div className="border-t border-[color:var(--line)] px-4 py-2">
                <button
                  onClick={handleLogout}
                  className="cursor-pointer w-full rounded-full bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 transition duration-200 hover:bg-red-200 hover:shadow-md active:scale-95"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
