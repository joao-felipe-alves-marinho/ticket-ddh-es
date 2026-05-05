"use client";

import { useState } from "react";
import { createTicket } from "../lib/auth";

type CreateTicketModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function CreateTicketModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTicketModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("low");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createTicket(title, description, urgency);
      setTitle("");
      setDescription("");
      setUrgency("low");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">
            Create New Ticket
          </h2>
          <button
            onClick={onClose}
            className="text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[color:var(--foreground)]">
                Title *
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
                maxLength={150}
                placeholder="Brief description of the issue"
                className="w-full rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
              />
              <p className="text-xs text-[color:var(--muted)]">
                {title.length}/150 characters
              </p>
            </label>
          </div>

          <div>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[color:var(--foreground)]">
                Description *
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={1}
                maxLength={2000}
                placeholder="Detailed description of the issue, steps to reproduce, expected behavior, etc."
                rows={5}
                className="w-full rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
              />
              <p className="text-xs text-[color:var(--muted)]">
                {description.length}/2000 characters
              </p>
            </label>
          </div>

          <div>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[color:var(--foreground)]">
                Urgency
              </span>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          <div className="flex gap-3 border-t border-[color:var(--line)] pt-5">
            <button
              type="submit"
              disabled={loading || !title.trim() || !description.trim()}
              className="cursor-pointer flex-1 rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-200 hover:bg-[color:var(--accent-strong)] hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Ticket"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer flex-1 rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition duration-200 hover:bg-[color:var(--surface-strong)] hover:border-[color:var(--accent)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
