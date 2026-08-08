"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { freshnessTickets, type FreshnessTicket, type TicketState } from "@/data/freshness-tasks";
import {
  HelpCircle,
  ArrowUpRight,
  UserX,
  Users,
  Search,
  CheckCircle2,
  Send,
  Loader2,
  ImageOff,
  MousePointer,
  ShoppingCart,
  PackageOpen,
  Store,
  AlertTriangle,
} from "lucide-react";

const ICONS: Record<FreshnessTicket["type"], React.ComponentType<{ className?: string }>> = {
  "slug-mismatch": Search,
  "team-change": Users,
  "retired-pro": UserX,
  "free-agent": HelpCircle,
  "missing-pro-image": ImageOff,
  "stub-mouse-created": MousePointer,
  "no-mouse-offers": ShoppingCart,
  "peripheral-missing": PackageOpen,
  "no-retailer-coverage": Store,
  "bad-product-image": AlertTriangle,
};

const LABELS: Record<FreshnessTicket["type"], string> = {
  "slug-mismatch": "Slug-mismatch",
  "team-change": "Team change",
  "retired-pro": "Retired pro",
  "free-agent": "Free agent",
  "missing-pro-image": "Missing pro image",
  "stub-mouse-created": "Mouse stub",
  "no-mouse-offers": "No offers",
  "peripheral-missing": "Missing peripherals",
  "no-retailer-coverage": "No retailer coverage",
  "bad-product-image": "Bad product image",
};

function TicketCard({
  ticket,
  state,
  onResolve,
  resolving,
}: {
  ticket: FreshnessTicket;
  state: TicketState;
  onResolve: (ticketId: string, answer: string) => void;
  resolving: string | null;
}) {
  const [answer, setAnswer] = useState("");
  const Icon = ICONS[ticket.type];
  const isPending = state.status === "pending";
  const isAnswered = state.status === "answered";
  const isApplied = state.status === "applied";
  const isResolving = resolving === ticket.id;

  return (
    <div
      className={`rounded-lg border p-5 transition-all ${
        isPending
          ? "border-amber-500/30 bg-amber-50/10"
          : isAnswered
            ? "border-emerald-500/30 bg-emerald-50/5"
            : "border-border/50 bg-card opacity-60"
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isPending
              ? "bg-amber-500/10 text-amber-500"
              : isAnswered
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {LABELS[ticket.type]}
            </span>
            {isPending && (
              <span className="text-[10px] font-medium text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                PENDING
              </span>
            )}
            {isAnswered && (
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                ANSWERED
              </span>
            )}
            {isApplied && (
              <span className="text-[10px] font-medium text-muted bg-muted-foreground/10 px-1.5 py-0.5 rounded-full">
                APPLIED
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold">{ticket.label}</h3>
        </div>
      </div>

      <div className="mb-4 rounded-md bg-muted/30 border border-border/30 p-3.5">
        <p className="text-sm font-medium mb-1 text-foreground">
          <span className="text-amber-600 font-bold">Q:</span>{" "}
          {ticket.question}
        </p>
      </div>

      <div className="space-y-1.5 mb-4">
        {ticket.context.esport && (
          <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground shrink-0 w-28">Esport:</span>
            <span className="font-medium">{ticket.context.esport}</span>
          </div>
        )}
        {ticket.context.storedTeam && (
          <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground shrink-0 w-28">Vores data:</span>
            <span className="font-medium">{ticket.context.storedTeam}</span>
          </div>
        )}
        {ticket.context.liquipediaTeam && (
          <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground shrink-0 w-28">Liquipedia:</span>
            <span className="font-medium">{ticket.context.liquipediaTeam}</span>
          </div>
        )}
        {ticket.context.liquipediaStatus && (
          <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground shrink-0 w-28">Status:</span>
            <span className="font-medium">{ticket.context.liquipediaStatus}</span>
          </div>
        )}
        {ticket.context.liquipediaUrl && (
          <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground shrink-0 w-28">Verificer:</span>
            <a
              href={ticket.context.liquipediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-0.5"
            >
              Liquipedia <ArrowUpRight className="h-2.5 w-2.5" />
            </a>
          </div>
        )}
        {ticket.context.sourceUrl && (
          <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground shrink-0 w-28">Kilde:</span>
            <a
              href={ticket.context.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-0.5"
            >
              ProSettings <ArrowUpRight className="h-2.5 w-2.5" />
            </a>
          </div>
        )}
        {ticket.context.proSlug && (
          <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground shrink-0 w-28">Pro:</span>
            <Link href={`/pro/${ticket.context.proSlug}`} className="font-medium text-primary hover:underline">
              {ticket.context.proSlug}
            </Link>
          </div>
        )}
        {ticket.context.mouseNavn && (
          <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground shrink-0 w-28">Mus:</span>
            <span className="font-medium">{ticket.context.mouseNavn}</span>
          </div>
        )}
        {ticket.context.sourcePro && (
          <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground shrink-0 w-28">Udløst af:</span>
            <Link href={`/pro/${ticket.context.sourcePro}`} className="font-medium text-primary hover:underline">
              {ticket.context.sourcePro}
            </Link>
          </div>
        )}
      </div>

      <div className="mb-4 rounded-md bg-muted/30 border border-border/30 p-3.5">
        <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Instruktioner</p>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{ticket.context.instructions}</p>
      </div>

      {isPending && (
        <div className="border-t border-border/30 pt-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && answer.trim()) {
                  onResolve(ticket.id, answer);
                }
              }}
              placeholder="Skriv dit svar her…"
              className="flex-1 rounded-md border border-border/50 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            <button
              onClick={() => onResolve(ticket.id, answer)}
              disabled={!answer.trim() || isResolving}
              className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isResolving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Resolve
            </button>
          </div>
        </div>
      )}

      {isAnswered && state.answer && (
        <div className="border-t border-emerald-500/20 pt-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-emerald-600">Svar:</span>{" "}
            &ldquo;{state.answer}&rdquo;
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Besvaret {state.answeredAt ? new Date(state.answeredAt).toLocaleDateString("da-DK") : ""}. Agenten vil anvende svaret på næste kørsel.
          </p>
        </div>
      )}

      {isApplied && state.answer && (
        <div className="border-t border-border/20 pt-3">
          <p className="text-sm text-muted-foreground line-through">
            <CheckCircle2 className="h-3.5 w-3.5 inline mr-1 text-muted-foreground" />
            &ldquo;{state.answer}&rdquo;
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Anvendt {state.appliedAt ? new Date(state.appliedAt).toLocaleDateString("da-DK") : ""}.
          </p>
        </div>
      )}
    </div>
  );
}

export default function TicketsPage() {
  const [states, setStates] = useState<Record<string, TicketState>>({});
  const [resolving, setResolving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tickets")
      .then((r) => r.json())
      .then((s) => setStates(s))
      .catch(() => setError("Kunne ikke hente ticket states."));
  }, []);

  async function handleResolve(ticketId: string, answer: string) {
    if (!answer.trim()) return;
    setResolving(ticketId);
    setError(null);
    try {
      const res = await fetch("/api/resolve-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, answer }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Kunne ikke gemme svar.");
        return;
      }
      setStates((prev) => ({
        ...prev,
        [ticketId]: {
          status: "answered",
          answer: answer.trim(),
          answeredAt: new Date().toISOString(),
          appliedAt: null,
        },
      }));
    } catch {
      setError("Netværksfejl. Prøv igen.");
    } finally {
      setResolving(null);
    }
  }

  const pending = freshnessTickets.filter((t) => (states[t.id]?.status ?? "pending") === "pending");
  const answered = freshnessTickets.filter((t) => (states[t.id]?.status ?? "pending") === "answered");
  const applied = freshnessTickets.filter((t) => states[t.id]?.status === "applied");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
            Tickets
          </h1>
          <p className="text-muted-foreground text-sm">
            {pending.length} venter &middot; {answered.length} besvaret &middot; {applied.length} anvendt
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-50/10 px-4 py-2.5 text-sm text-red-600">
          {error}
        </div>
      )}

      {freshnessTickets.length === 0 && (
        <div className="rounded-lg border border-border/50 p-8 text-center">
          <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Ingen tickets. Agenten har ikke brug for hjælp lige nu.
          </p>
        </div>
      )}

      {pending.length + answered.length > 0 && (
        <div className="space-y-4 mb-10">
          {[...pending, ...answered].map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              state={states[ticket.id] ?? { status: "pending", answer: null, answeredAt: null, appliedAt: null }}
              onResolve={handleResolve}
              resolving={resolving}
            />
          ))}
        </div>
      )}

      {applied.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Anvendte tickets ({applied.length})
          </h2>
          <div className="space-y-4">
            {applied.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                state={states[ticket.id] ?? { status: "pending", answer: null, answeredAt: null, appliedAt: null }}
                onResolve={handleResolve}
                resolving={resolving}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
