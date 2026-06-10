import { useState } from "react";

interface SuggestionDetailProps {
    label: string;
    items: string[];
    tone: "pros" | "cons";
}

export function SuggestionDetail({
    label,
    items,
    tone,
}: SuggestionDetailProps) {
    const [isOpen, setIsOpen] = useState(false);
    const toneClasses = tone === "pros"
        ? `${isOpen ? "bg-emerald-500/25" : "bg-emerald-500/15"} text-emerald-300 focus-visible:ring-emerald-400/60`
        : `${isOpen ? "bg-rose-500/25" : "bg-rose-500/15"} text-rose-300 focus-visible:ring-rose-400/60`;

    return (
        <div className="relative group/detail">
            <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((open) => !open)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-display font-semibold uppercase tracking-wider outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-card ${toneClasses}`}
            >
                {label}
            </button>
            <div className={`absolute left-0 top-full z-20 mt-2 w-56 rounded-md border border-border bg-popover p-3 text-xs text-popover-foreground shadow-lg group-hover/detail:block ${isOpen ? "block" : "hidden"}`}>
                {items.length > 0 ? (
                    <ul className="space-y-1">
                        {items.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No {label.toLowerCase()} available.</p>
                )}
            </div>
        </div>
    );
}
