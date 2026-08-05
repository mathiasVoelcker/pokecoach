import { CheckCircle2, Lightbulb, ShieldCheck, Swords, X } from "lucide-react";
import type { TeamEvalResponse } from "../types/Pokemon.types";

interface TeamEvaluationDialogProps {
  evaluation: TeamEvalResponse | null;
  onClose: () => void;
}

type GradeDetails = {
  letter: string;
  colorClass: string;
  ringClass: string;
};

function getGradeDetails(score: number): GradeDetails {
  const normalizedScore = Math.max(0, Math.min(10, score));

  if (normalizedScore >= 9.5) return { letter: "A+", colorClass: "text-emerald-300", ringClass: "border-emerald-400/60 bg-emerald-400/10" };
  if (normalizedScore >= 9) return { letter: "A", colorClass: "text-green-300", ringClass: "border-green-400/60 bg-green-400/10" };
  if (normalizedScore >= 8.5) return { letter: "A-", colorClass: "text-lime-300", ringClass: "border-lime-400/60 bg-lime-400/10" };
  if (normalizedScore >= 8) return { letter: "B+", colorClass: "text-yellow-300", ringClass: "border-yellow-400/60 bg-yellow-400/10" };
  if (normalizedScore >= 7) return { letter: "B", colorClass: "text-amber-300", ringClass: "border-amber-400/60 bg-amber-400/10" };
  if (normalizedScore >= 6) return { letter: "C", colorClass: "text-orange-300", ringClass: "border-orange-400/60 bg-orange-400/10" };
  if (normalizedScore >= 5) return { letter: "D", colorClass: "text-orange-400", ringClass: "border-orange-500/60 bg-orange-500/10" };
  return { letter: "F", colorClass: "text-red-400", ringClass: "border-red-500/60 bg-red-500/10" };
}

function EvaluationList({ items, emptyMessage }: { items: string[]; emptyMessage: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2 text-sm leading-5 text-foreground/90">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function TeamEvaluationDialog({ evaluation, onClose }: TeamEvaluationDialogProps) {
  if (!evaluation) { 
    return null
  }

  console.log(evaluation)
  const grade = getGradeDetails(evaluation.grade);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="presentation"
    >
      <section
        aria-modal="true"
        aria-labelledby="team-evaluation-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-7"
        role="dialog"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-widest text-accent">PokéCoach Report</p>
            <h2 id="team-evaluation-title" className="font-display text-2xl font-bold">Team evaluation</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close team evaluation"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-5 rounded-xl border border-border bg-background/40 p-5 sm:flex-row sm:items-center">
          <div className={`flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-2 font-display text-5xl font-bold ${grade.ringClass} ${grade.colorClass}`}>
            {grade.letter}
          </div>
          <div>
            <p className={`font-display text-lg font-bold ${grade.colorClass}`}>Grade {grade.letter}</p>
            {/* <p className="mt-1 text-sm text-muted-foreground">Score: {evaluation.grade.toFixed(1)} / 10</p> */}
            <p className="mt-3 leading-6 text-foreground/90">{evaluation.overallTeamDescription}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 text-emerald-200">
            <h3 className="mb-3 flex items-center gap-2 font-display font-bold text-emerald-300"><CheckCircle2 className="h-5 w-5" />Strengths</h3>
            <EvaluationList items={evaluation.pros} emptyMessage="No strengths were listed." />
          </div>
          <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-4 text-red-200">
            <h3 className="mb-3 flex items-center gap-2 font-display font-bold text-red-300"><ShieldCheck className="h-5 w-5" />Weaknesses</h3>
            <EvaluationList items={evaluation.cons} emptyMessage="No weaknesses were listed." />
          </div>
          <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4 md:col-span-2">
            <h3 className="mb-2 flex items-center gap-2 font-display font-bold text-cyan-300"><Swords className="h-5 w-5" />How to play it</h3>
            <p className="leading-6 text-foreground/90">{evaluation.howToPlayIt}</p>
          </div>
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 md:col-span-2">
            <h3 className="mb-2 flex items-center gap-2 font-display font-bold text-amber-300"><Lightbulb className="h-5 w-5" />What should change</h3>
            <p className="leading-6 text-foreground/90">{evaluation.whatShouldChange || "No changes were suggested."}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className="rounded-lg bg-primary px-4 py-2 font-display text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
            Close
          </button>
        </div>
      </section>
    </div>
  );
}
