import { AlertTriangle, CheckCircle2, FileQuestion, Info } from "lucide-react";
import { GroundingStatus } from "@/lib/intake/schemas";

const groundingPresentation: Record<
  GroundingStatus,
  {
    label: string;
    className: string;
    icon: typeof CheckCircle2;
  }
> = {
  not_connected: {
    label: "Dokumentensuche nicht angebunden",
    className: "border-amber-200 bg-amber-50 text-amber-950",
    icon: Info,
  },
  grounded: {
    label: "Mit Dokumentstellen belegt",
    className: "border-teal-200 bg-teal-50 text-teal-950",
    icon: CheckCircle2,
  },
  partially_grounded: {
    label: "Teilweise belegt",
    className: "border-amber-200 bg-amber-50 text-amber-950",
    icon: FileQuestion,
  },
  insufficient_evidence: {
    label: "Keine ausreichende Quelle",
    className: "border-amber-200 bg-amber-50 text-amber-950",
    icon: AlertTriangle,
  },
  source_conflict: {
    label: "Quellenkonflikt",
    className: "border-amber-300 bg-amber-50 text-amber-950",
    icon: AlertTriangle,
  },
};

interface GroundingBadgeProps {
  status: GroundingStatus;
}

export default function GroundingBadge({ status }: GroundingBadgeProps) {
  const presentation = groundingPresentation[status];
  const Icon = presentation.icon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        presentation.className,
      ].join(" ")}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {presentation.label}
    </span>
  );
}
