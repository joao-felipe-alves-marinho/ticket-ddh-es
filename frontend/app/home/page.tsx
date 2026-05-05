"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readSession, type SessionUser, fetchAllTickets, type TicketReadModel } from "../../lib/auth";
import { Navbar } from "../../components/navbar";
import { TicketDetailModal } from "../../components/ticket-detail-modal";
import { CreateTicketModal } from "../../components/create-ticket-modal";

export default function HomePage() {
  const router = useRouter();
  const [session] = useState<SessionUser | null>(() => readSession());
  const [tickets, setTickets] = useState<TicketReadModel[] | null>(null);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketReadModel | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }

    async function loadTickets() {
      setLoadingTickets(true);
      setTicketsError(null);
      try {
        const all = await fetchAllTickets();
        setTickets(all);
      } catch (err) {
        setTicketsError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingTickets(false);
      }
    }

    loadTickets();
  }, [router, session]);

  function handleTicketClick(ticket: TicketReadModel) {
    setSelectedTicket(ticket);
    setModalOpen(true);
  }

  async function handleActionSuccess() {
    // Reload tickets after action succeeds
    setLoadingTickets(true);
    setTicketsError(null);
    try {
      const all = await fetchAllTickets();
      setTickets(all);
    } catch (err) {
      setTicketsError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingTickets(false);
    }
  }

  function handleCloseModal() {
    setModalOpen(false);
    setSelectedTicket(null);
  }

  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] px-6 py-8 text-center shadow-[var(--shadow)]">
          <p className="text-sm text-[color:var(--muted)]">Loading your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[color:var(--background)]">
      <Navbar session={session} />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-[color:var(--foreground)]">Tickets</h1>
              <p className="mt-1 text-sm text-[color:var(--muted)]">Manage and track all tickets in the system</p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="cursor-pointer rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-200 hover:bg-[color:var(--accent-strong)] hover:shadow-lg active:scale-95"
            >
              + Create Ticket
            </button>
          </div>

          {loadingTickets ? (
            <div className="flex justify-center py-12">
              <div className="text-sm text-[color:var(--muted)]">Loading tickets...</div>
            </div>
          ) : ticketsError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{ticketsError}</p>
            </div>
          ) : !tickets || tickets.length === 0 ? (
            <div className="rounded-lg border border-[color:var(--line)] bg-[color:var(--surface)] p-8 text-center">
              <p className="text-sm text-[color:var(--muted)]">No tickets found.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket)}
                  className="cursor-pointer rounded-lg border border-[color:var(--line)] bg-[color:var(--surface)] p-4 transition duration-200 hover:border-[color:var(--accent)] hover:shadow-lg hover:bg-[color:var(--surface-strong)] active:scale-98"
                >
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-[color:var(--foreground)] break-words">
                          {ticket.title}
                        </h3>
                        <div className="flex gap-2">
                          {ticket.status && (
                            <span className="inline-flex whitespace-nowrap rounded-full bg-[color:var(--accent-soft)] px-2 py-1 text-xs font-semibold text-[color:var(--accent-strong)]">
                              {ticket.status}
                            </span>
                          )}
                          {ticket.urgency && (
                            <span className="inline-flex whitespace-nowrap rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                              {ticket.urgency}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="mt-2 text-sm text-[color:var(--muted)] break-words">
                        {ticket.description ? ticket.description.substring(0, 120) + (ticket.description.length > 120 ? "..." : "") : "No description"}
                      </p>

                      <div className="mt-3 grid gap-2 text-xs text-[color:var(--muted)] sm:grid-cols-3">
                        <div>
                          <span className="font-semibold">Reporter ID:</span> {ticket.reporterId ?? "-"}
                        </div>
                        <div>
                          <span className="font-semibold">Ticket ID:</span> {ticket.id}
                        </div>
                        {ticket.assigneeId && (
                          <div>
                            <span className="font-semibold">Assigned to:</span> {ticket.assigneeId}
                          </div>
                        )}
                      </div>

                      {ticket.createdAt && (
                        <div className="mt-2 text-xs text-[color:var(--muted)]">
                          Created: {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {session && selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          session={session}
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onActionSuccess={handleActionSuccess}
        />
      )}

      <CreateTicketModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
