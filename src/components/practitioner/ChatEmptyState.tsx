import { MessageSquareText } from "lucide-react";
import { chatCopy } from "@/lib/intake/copy";

interface ChatEmptyStateProps {
  isGeneral: boolean;
  onSelectPrompt: (prompt: string) => void;
}

export default function ChatEmptyState({ isGeneral, onSelectPrompt }: ChatEmptyStateProps) {
  const prompts = isGeneral ? chatCopy.generalExamplePrompts : chatCopy.mdroExamplePrompts;

  return (
    <div className="rounded-md bg-white/80 p-4 text-sm leading-6 text-zinc-600">
      <div className="flex gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-800">
          <MessageSquareText className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p>{isGeneral ? chatCopy.generalEmpty : chatCopy.mdroEmpty}</p>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {chatCopy.emptyPromptLabel}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{chatCopy.emptyPromptHint}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => onSelectPrompt(prompt)}
                  className="rounded-full bg-zinc-100 px-3 py-1.5 text-left text-xs font-semibold leading-5 text-zinc-700 transition hover:bg-teal-50 hover:text-teal-950"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
