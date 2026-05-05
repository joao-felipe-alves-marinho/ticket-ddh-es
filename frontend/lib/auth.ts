export type UserRole = "reporter" | "agent" | "manager";

export type SessionUser = {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: UserRole | string;
};

type LoginResponse = SessionUser;

type RegisterResponse = {
  id: string;
};

const STORAGE_KEY = "issueflow-session";

export function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1"
  );
}

async function readResponseError(response: Response) {
  const text = await response.text();

  if (!text) {
    return `Request failed with status ${response.status}.`;
  }

  try {
    const payload = JSON.parse(text) as { message?: string | string[] };
    if (Array.isArray(payload.message)) {
      return payload.message.join(" ");
    }
    if (typeof payload.message === "string") {
      return payload.message;
    }
  } catch {
    // Fall back to the raw response body.
  }

  return text;
}

async function postJson<T>(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await readResponseError(response));
  }

  return (await response.json()) as T;
}

export async function loginUser(email: string, password: string) {
  return postJson<LoginResponse>("/auth/login", { email, password });
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  return postJson<RegisterResponse>("/auth/register", payload);
}

export function saveSession(session: SessionUser) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function readSession(): SessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as SessionUser;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export type TicketReadModel = {
  id: string;
  title: string;
  description?: string;
  urgency?: string;
  status?: string;
  priority?: string;
  reporterId?: string;
  assigneeId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchAllTickets(): Promise<TicketReadModel[]> {
  const session = readSession();
  const base = getApiBaseUrl();

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (session?.token) {
    headers["Authorization"] = `Bearer ${session.token}`;
  }

  const res = await fetch(`${base}/tickets`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const errorText = await readResponseError(res as Response);
    throw new Error(errorText);
  }

  const json = await res.json();
  if (Array.isArray(json)) {
    return json as TicketReadModel[];
  }

  if (json && typeof json === "object") {
    return Object.values(json as Record<string, TicketReadModel>);
  }

  return [];
}

// Ticket action functions
async function callTicketAction(
  ticketId: string,
  action: string,
  body?: Record<string, unknown>
): Promise<{ message: string }> {
  const session = readSession();
  if (!session?.token) {
    throw new Error("Not authenticated");
  }

  const base = getApiBaseUrl();
  const url = `${base}/tickets/${ticketId}/${action}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await readResponseError(response as Response));
  }

  return (await response.json()) as { message: string };
}

export async function triageTicket(
  ticketId: string,
  priority: string
): Promise<{ message: string }> {
  return callTicketAction(ticketId, "triage", { priority });
}

export async function startProgress(ticketId: string): Promise<{ message: string }> {
  return callTicketAction(ticketId, "start-progress");
}

export async function blockTicket(
  ticketId: string,
  blockReason: string
): Promise<{ message: string }> {
  return callTicketAction(ticketId, "block", { blockReason });
}

export async function resolveTicket(ticketId: string): Promise<{ message: string }> {
  return callTicketAction(ticketId, "resolve");
}

export async function cancelTicket(ticketId: string): Promise<{ message: string }> {
  return callTicketAction(ticketId, "cancel");
}

export async function reopenTicket(ticketId: string): Promise<{ message: string }> {
  return callTicketAction(ticketId, "reopen");
}

export async function assignTicket(
  ticketId: string,
  assigneeId: string
): Promise<{ message: string }> {
  return callTicketAction(ticketId, "assign", { assigneeId });
}

export async function createTicket(
  title: string,
  description: string,
  urgency: string
): Promise<{ id: string }> {
  const session = readSession();
  if (!session?.token) {
    throw new Error("Not authenticated");
  }

  const base = getApiBaseUrl();
  const response = await fetch(`${base}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify({ title, description, urgency }),
  });

  if (!response.ok) {
    throw new Error(await readResponseError(response as Response));
  }

  return (await response.json()) as { id: string };
}
