"use client";

import { useRef } from "react";

interface OptionChipProps {
  label: string;
  isSelected: boolean;
  hasFreitext?: boolean;
  freitextValue?: string;
  onToggle: () => void;
  onFreitextChange?: (value: string) => void;
}

export default function OptionChip({
  label,
  isSelected,
  hasFreitext,
  freitextValue = "",
  onToggle,
  onFreitextChange,
}: OptionChipProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const showInput = hasFreitext && isSelected;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "inline-flex items-center gap-0 rounded-full text-sm transition-all duration-150 cursor-pointer select-none",
        showInput ? "pl-4 pr-2 py-2" : "px-4 py-2",
        isSelected
          ? "bg-zinc-900 text-white border border-zinc-900"
          : "border border-zinc-200 text-zinc-700 hover:border-zinc-400 bg-white",
      ].join(" ")}
    >
      <span>{label}</span>

      {showInput && (
        <span
          className="flex items-center ml-2 pl-2 border-l border-white/30"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            ref={inputRef}
            type="text"
            value={freitextValue}
            onChange={(e) => onFreitextChange?.(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Type here..."
            className="bg-transparent text-white placeholder:text-white/50 outline-none w-28 text-sm"
            autoFocus
          />
        </span>
      )}
    </button>
  );
}
