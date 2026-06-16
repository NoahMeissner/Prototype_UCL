"use client";

import dynamic from "next/dynamic";
import { SourceCitation } from "@/lib/intake/schemas";

interface PdfPagePreviewProps {
  source: SourceCitation;
  maxWidth?: number;
  className?: string;
}

const PdfPagePreviewRenderer = dynamic(() => import("./PdfPagePreviewRenderer"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-52 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-500">
      PDF-Vorschau wird vorbereitet...
    </div>
  ),
});

export default function PdfPagePreview(props: PdfPagePreviewProps) {
  return <PdfPagePreviewRenderer {...props} />;
}
