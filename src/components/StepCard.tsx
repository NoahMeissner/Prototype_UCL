"use client";

import { Option } from "@/lib/types";
import OptionChip from "./OptionChip";

interface StepCardProps {
  question: string;
  hint?: string;
  description?: string;
  options: Option[];
  stepId: number;
  selectedKeys: string[];
  freitextValues: Record<string, string>;
  onToggle: (key: string) => void;
  onFreitext: (key: string, value: string) => void;
}

export default function StepCard({
  question,
  hint,
  description,
  options,
  stepId,
  selectedKeys,
  freitextValues,
  onToggle,
  onFreitext,
}: StepCardProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-900 tracking-tight mb-1">
        {question}
      </h2>
      {hint && <p className="text-sm text-zinc-500 mb-3">{hint}</p>}
      {description && (
        <p className="text-xs text-zinc-400 leading-relaxed mb-5">{description}</p>
      )}
      {!hint && !description && <div className="mb-5" />}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <OptionChip
            key={opt.key}
            label={opt.label}
            isSelected={selectedKeys.includes(opt.key)}
            hasFreitext={opt.hasFreitext}
            freitextValue={freitextValues[`${stepId}-${opt.key}`] ?? ""}
            onToggle={() => onToggle(opt.key)}
            onFreitextChange={(val) => onFreitext(opt.key, val)}
          />
        ))}
      </div>
    </div>
  );
}
