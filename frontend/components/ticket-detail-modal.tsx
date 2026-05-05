"use client";

import { useState } from "react";
import type { SessionUser } from "../lib/auth";
import type { TicketReadModel } from "../lib/auth";
import {
  triageTicket,
  blockTicket,
  resolveTicket,
  cancelTicket,
  reopenTicket,
  startProgress,
  assignTicket,
} from "../lib/auth";

type TicketDetailModalProps = {
  ticket: TicketReadModel;
  session: SessionUser;
  isOpen: boolean;
  onClose: () => void;
  onActionSuccess: () => void;
};

export function TicketDetailModal({
  ticket,
  session,
  isOpen,
  onClose,
  onActionSuccess,
}: TicketDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [showTriageForm, setShowTriageForm] = useState(false);
  const [priority, setPriority] = useState("medium");
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assigneeId, setAssigneeId] = useState("");

  const isAgent = session.role === "agent";
  const isManager = session.role === "manager";

  // Determine which actions are available based on ticket status
  const status = ticket.status?.toLowerCase() || "";
  const canTriage = !["in_progress", "resolved", "blocked", "cancelled"].includes(status);
  const canAssign = !["in_progress", "resolved", "blocked", "cancelled"].includes(status);
  const canStartProgress = ["triaged", "assigned"].includes(status);
  const canResolve = status === "in_progress";
  const canBlock = !["resolved", "cancelled"].includes(status);
  const canReopen = ["resolved", "blocked", "cancelled"].includes(status);

  if (!isOpen) return null;

  async function handleAction(action: () => Promise<{ message: string }>) {
    setLoading(true);
    setError(null);
    try {
      await action();
      setShowBlockForm(false);
      setShowTriageForm(false);
      setShowAssignForm(false);
      setBlockReason("");
      setPriority("medium");
      setAssigneeId("");
      onActionSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">
              {ticket.title}
            </h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">ID: {ticket.id}</p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 border-b border-[color:var(--line)] pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
              Description
            </p>
            <p className="mt-1 text-sm text-[color:var(--foreground)]">
              {ticket.description || "No description"}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
                Status
              </p>
              <p className="mt-1 inline-flex rounded-full bg-[color:var(--accent-soft)] px-2 py-1 text-xs font-semibold text-[color:var(--accent-strong)]">
                {ticket.status || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
                Urgency
              </p>
              <p className="mt-1 inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                {ticket.urgency || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
                Reporter
              </p>
              <p className="mt-1 text-sm text-[color:var(--foreground)]">
                {ticket.reporterId || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
                Assigned To
              </p>
              <p className="mt-1 text-sm text-[color:var(--foreground)]">
                {ticket.assigneeId || "Unassigned"}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
            Actions
          </div>

          {/* Agent & Manager Actions */}
          {(isAgent || isManager) && (
            <>
              {/* 1. TRIAGE - First step */}
              {!showTriageForm ? (
                <button
                  onClick={() => setShowTriageForm(true)}
                  disabled={loading || !canTriage}
                  title={!canTriage ? "Triage only available for new/open tickets" : ""}
                  className="cursor-pointer block w-full rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[color:var(--foreground)] transition duration-200 hover:bg-[color:var(--surface-strong)] hover:border-[color:var(--accent)] hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  1. Triage (Set Priority)
                </button>
              ) : (
                <div className="rounded-lg border border-[color:var(--line)] bg-white p-4">
                  <label className="block space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
                      Priority
                    </span>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--foreground)]"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </label>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        handleAction(() => triageTicket(ticket.id, priority))
                      }
                      disabled={loading}
                      className="cursor-pointer flex-1 rounded-lg bg-[color:var(--accent)] px-3 py-2 text-sm font-semibold text-white shadow-md transition duration-200 hover:bg-[color:var(--accent-strong)] hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Processing..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => setShowTriageForm(false)}
                      disabled={loading}
                      className="cursor-pointer flex-1 rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-[color:var(--foreground)] transition duration-200 hover:bg-[color:var(--surface-strong)] hover:border-[color:var(--accent)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* 2. ASSIGN - Second step */}
              {!showAssignForm ? (
                <button
                  onClick={() => setShowAssignForm(true)}
                  disabled={loading || !canAssign}
                  title={!canAssign ? "Assign only available before ticket is in progress" : ""}
                  className="cursor-pointer block w-full rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[color:var(--foreground)] transition duration-200 hover:bg-[color:var(--surface-strong)] hover:border-[color:var(--accent)] hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  2. Assign Ticket
                </button>
              ) : (
                <div className="rounded-lg border border-[color:var(--line)] bg-white p-4">
                  <label className="block space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
                      Assignee ID
                    </span>
                    <input
                      type="text"
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      placeholder="Enter user ID to assign"
                      className="w-full rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--foreground)]"
                    />
                  </label>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        handleAction(() =>
                          assignTicket(ticket.id, assigneeId)
                        )
                      }
                      disabled={loading || !assigneeId.trim()}
                      className="cursor-pointer flex-1 rounded-lg bg-[color:var(--accent)] px-3 py-2 text-sm font-semibold text-white shadow-md transition duration-200 hover:bg-[color:var(--accent-strong)] hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Processing..." : "Assign"}
                    </button>
                    <button
                      onClick={() => setShowAssignForm(false)}
                      disabled={loading}
                      className="cursor-pointer flex-1 rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-[color:var(--foreground)] transition duration-200 hover:bg-[color:var(--surface-strong)] hover:border-[color:var(--accent)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* 3. START PROGRESS - Third step */}
              <button
                onClick={() => handleAction(() => startProgress(ticket.id))}
                disabled={loading || !canStartProgress}
                title={!canStartProgress ? "Start progress only available for triaged/assigned tickets" : ""}
                className="cursor-pointer block w-full rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[color:var(--foreground)] transition duration-200 hover:bg-[color:var(--surface-strong)] hover:border-[color:var(--accent)] hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                3. Start Progress
              </button>

              {/* 4. RESOLVE - Fourth step */}
              <button
                onClick={() => handleAction(() => resolveTicket(ticket.id))}
                disabled={loading || !canResolve}
                title={!canResolve ? "Resolve only available for in-progress tickets" : ""}
                className="cursor-pointer block w-full rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[color:var(--foreground)] transition duration-200 hover:bg-green-50 hover:border-green-400 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                4. Resolve Ticket
              </button>

              {/* 5. BLOCK - Can be done at most stages */}
              {!showBlockForm ? (
                <button
                  onClick={() => setShowBlockForm(true)}
                  disabled={loading || !canBlock}
                  title={!canBlock ? "Cannot block resolved or cancelled tickets" : ""}
                  className="cursor-pointer block w-full rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[color:var(--foreground)] transition duration-200 hover:bg-[color:var(--surface-strong)] hover:border-orange-400 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  5. Block Ticket
                </button>
              ) : (
                <div className="rounded-lg border border-[color:var(--line)] bg-white p-4">
                  <label className="block space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
                      Block Reason
                    </span>
                    <textarea
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="Why is this ticket blocked?"
                      className="w-full rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--foreground)]"
                      rows={3}
                    />
                  </label>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        handleAction(() => blockTicket(ticket.id, blockReason))
                      }
                      disabled={loading || !blockReason.trim()}
                      className="cursor-pointer flex-1 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-md transition duration-200 hover:bg-orange-600 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Processing..." : "Block"}
                    </button>
                    <button
                      onClick={() => setShowBlockForm(false)}
                      disabled={loading}
                      className="cursor-pointer flex-1 rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-[color:var(--foreground)] transition duration-200 hover:bg-[color:var(--surface-strong)] hover:border-[color:var(--accent)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Manager Only Actions */}
          {isManager && (
            <>
              <div className="border-t border-[color:var(--line)] pt-4">
                {/* 6. REOPEN - Manager can reopen closed tickets */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleAction(() => reopenTicket(ticket.id))}
                    disabled={loading || !canReopen}
                    title={!canReopen ? "Reopen only available for resolved/blocked/cancelled tickets" : ""}
                    className="cursor-pointer block w-full rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[color:var(--foreground)] transition duration-200 hover:bg-[color:var(--surface-strong)] hover:border-[color:var(--accent)] hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reopen Ticket
                  </button>

                  {/* CANCEL - Manager only destructive action */}
                  <button
                    onClick={() => handleAction(() => cancelTicket(ticket.id))}
                    disabled={loading}
                    className="cursor-pointer block w-full rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition duration-200 hover:bg-red-100 hover:border-red-500 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel Ticket (Destructive)
                  </button>
                </div>
              </div>
            </>
          )}

          {!isAgent && !isManager && (
            <div className="rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-3">
              <p className="text-xs text-[color:var(--muted)]">
                As a {session.role}, you don&apos;t have permissions to modify this ticket. Only agents and managers can take actions.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-[color:var(--line)] pt-4">
          <button
            onClick={onClose}
            className="cursor-pointer w-full rounded-lg border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-[color:var(--foreground)] transition duration-200 hover:bg-[color:var(--surface-strong)] hover:border-[color:var(--accent)] hover:shadow-md active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
