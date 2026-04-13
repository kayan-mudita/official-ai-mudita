import type { Reference } from "@/data/topic-libraries";

interface ReferencesSectionProps {
  references: Reference[];
}

export default function ReferencesSection({ references }: ReferencesSectionProps) {
  if (!references || references.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-white/[0.06]">
      <h3 className="text-p2 font-semibold text-white/70 uppercase tracking-wider mb-4">
        References
      </h3>
      <ol className="space-y-2">
        {references.map((ref, i) => (
          <li key={i} className="text-p3 text-white/70 leading-relaxed">
            <span className="text-white/70 mr-2">[{i + 1}]</span>
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400/60 hover:text-blue-400 transition-colors"
            >
              {ref.title}
            </a>
            <span className="text-white/70">
              {" "}— {ref.publisher}
              {ref.accessDate && `. Accessed ${ref.accessDate}`}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
