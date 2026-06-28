"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { SourceBoundingBox, SourceCitation } from "@/lib/intake/schemas";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function useElementWidth<TElement extends HTMLElement>() {
  const ref = useRef<TElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    setWidth(element.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

function sourceBboxes(source: SourceCitation): SourceBoundingBox[] {
  if (source.bboxes?.length) return source.bboxes;
  return source.bbox ? [source.bbox] : [];
}

function PdfHighlightOverlay({
  bboxes,
  page,
}: {
  bboxes: SourceBoundingBox[];
  page: number;
}) {
  const visibleBboxes = bboxes.filter((bbox) => bbox.page === page);
  if (visibleBboxes.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0">
      {visibleBboxes.map((bbox, index) => (
        <span
          key={`${bbox.page}-${bbox.x}-${bbox.y}-${index}`}
          className="absolute rounded-sm border border-teal-600 bg-teal-300/25 shadow-[0_0_0_9999px_rgba(15,23,42,0.04)]"
          style={{
            left: `${bbox.x * 100}%`,
            top: `${bbox.y * 100}%`,
            width: `${bbox.width * 100}%`,
            height: `${bbox.height * 100}%`,
          }}
        />
      ))}
    </div>
  );
}

interface PdfPagePreviewRendererProps {
  source: SourceCitation;
  maxWidth?: number;
  cropToBbox?: boolean;
  className?: string;
}

export default function PdfPagePreviewRenderer({
  source,
  maxWidth = 360,
  cropToBbox = false,
  className = "",
}: PdfPagePreviewRendererProps) {
  const [containerRef, containerWidth] = useElementWidth<HTMLDivElement>();
  const [renderedHeight, setRenderedHeight] = useState<number | null>(null);
  const page = source.page ?? source.bbox?.page ?? source.bboxes?.[0]?.page ?? 1;
  const bboxes = sourceBboxes(source);
  const file = useMemo(() => (source.pdfUrl ? { url: source.pdfUrl } : null), [source.pdfUrl]);
  const pageWidth = Math.max(220, Math.min(containerWidth || maxWidth, maxWidth));

  useEffect(() => {
    setRenderedHeight(null);
  }, [source.pdfUrl, page]);

  const primaryBbox = cropToBbox ? (bboxes.find((b) => b.page === page) ?? null) : null;
  const isCropped = cropToBbox && primaryBbox !== null && renderedHeight !== null;

  let clipTop = 0;
  let clipHeight: number | undefined = undefined;

  if (isCropped && primaryBbox && renderedHeight) {
    const padding = Math.max(16, primaryBbox.height * renderedHeight * 0.25);
    clipTop = Math.max(0, primaryBbox.y * renderedHeight - padding);
    clipHeight = primaryBbox.height * renderedHeight + padding * 2;
  }

  if (!file) {
    return (
      <div
        className={[
          "flex min-h-40 items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-sm font-medium text-zinc-500",
          className,
        ].join(" ")}
      >
        <FileText className="mr-2 size-4" aria-hidden="true" />
        Keine PDF-Vorschau verbunden
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={["overflow-hidden rounded-md border border-zinc-200 bg-zinc-100", className].join(" ")}
    >
      <Document
        className="flex justify-center"
        file={file}
        loading={
          <div className="flex min-h-52 items-center justify-center text-sm font-medium text-zinc-500">
            PDF wird geladen...
          </div>
        }
        error={
          <div className="flex min-h-52 items-center justify-center px-4 text-center text-sm font-medium text-rose-700">
            Die PDF-Vorschau konnte nicht geladen werden.
          </div>
        }
      >
        <div style={{ overflow: "hidden", height: clipHeight }}>
          <div style={{ transform: isCropped ? `translateY(${-clipTop}px)` : undefined }}>
            <div className="relative mx-auto inline-block bg-white">
              <Page
                pageNumber={page}
                width={pageWidth}
                loading={
                  <div className="flex min-h-52 items-center justify-center text-sm font-medium text-zinc-500">
                    Seite wird geladen...
                  </div>
                }
                renderAnnotationLayer
                renderTextLayer
                onRenderSuccess={(p: { width: number; height: number }) => {
                  setRenderedHeight(p.height);
                }}
              />
              <PdfHighlightOverlay bboxes={bboxes} page={page} />
            </div>
          </div>
        </div>
      </Document>
    </div>
  );
}
