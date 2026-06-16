interface AnswerSectionProps {
  label: string;
  value: string;
}

export default function AnswerSection({ label, value }: AnswerSectionProps) {
  return (
    <section className="space-y-1.5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</h2>
      <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-800">{value}</p>
    </section>
  );
}
