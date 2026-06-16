"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";
import { terminalCopy } from "@/lib/intake/copy";
import { TerminalTarget } from "@/lib/intake/schemas";

interface ExitScreenProps {
  target: TerminalTarget;
  onReset: () => void;
}

export default function ExitScreen({ target, onReset }: ExitScreenProps) {
  const copy = terminalCopy[target];
  const isDanger = copy.tone === "danger";
  const Icon = isDanger ? ShieldAlert : AlertTriangle;

  return (
    <section
      className={[
        "surface-enter rounded-lg border p-5 shadow-sm",
        isDanger ? "border-rose-200 bg-rose-50 text-rose-950" : "border-amber-200 bg-amber-50 text-amber-950",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 size-5 shrink-0 ${isDanger ? "text-rose-600" : "text-amber-600"}`} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{copy.title}</h1>
          <p className="mt-3 text-sm leading-6">{copy.body}</p>
          <div className="mt-4 rounded-md bg-white/70 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">Nächster Schritt</p>
            <p className="mt-1 text-sm font-medium">{copy.action}</p>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-md border border-current/20 bg-white/80 px-3 py-2 text-sm font-medium transition hover:bg-white active:translate-y-px"
      >
        Neue Anfrage starten
      </button>
    </section>
  );
}
