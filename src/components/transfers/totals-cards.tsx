'use client';

// Removed unused imports
import { formatEuro } from '@/lib/fmt';

interface TotalsData {
  amount: number;
  fee: number;
  count: number;
  countPosted: number;
  countCancelled: number;
}

interface TotalsCardsProps {
  totals: TotalsData;
  title?: string;
}

export function TotalsCards({ totals, title = "Gesamt" }: TotalsCardsProps) {
  const totalRevenue = totals.amount + totals.fee;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Betrag */}
      <div className="kpi-card">
        <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-[var(--radius)] bg-[var(--primary)]" />
        <div className="text-sm text-[var(--muted)]">{title} Betrag</div>
        <div className="mt-1 text-3xl font-semibold tracking-[-0.01em] tabular-nums text-[var(--text)]">
          {formatEuro(totals.amount)}
        </div>
        <div className="mt-1 text-xs text-[var(--muted)]">Netto Transaktionen</div>
      </div>

      {/* Gebühren */}
      <div className="kpi-card">
        <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-[var(--radius)] bg-[var(--success)]" />
        <div className="text-sm text-[var(--muted)]">{title} Gebühren</div>
        <div className="mt-1 text-3xl font-semibold tracking-[-0.01em] tabular-nums text-[var(--text)]">
          {formatEuro(totals.fee)}
        </div>
        <div className="mt-1 text-xs text-[var(--muted)]">Gesamte Gebühren</div>
      </div>

      {/* Umsatz */}
      <div className="kpi-card">
        <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-[var(--radius)] bg-[var(--warn)]" />
        <div className="text-sm text-[var(--muted)]">{title} Umsatz</div>
        <div className="mt-1 text-3xl font-semibold tracking-[-0.01em] tabular-nums text-[var(--text)]">
          {formatEuro(totalRevenue)}
        </div>
        <div className="mt-1 text-xs text-[var(--muted)]">Betrag + Gebühren</div>
      </div>

      {/* Transaktionen */}
      <div className="kpi-card">
        <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-[var(--radius)] bg-[var(--primary)]" />
        <div className="text-sm text-[var(--muted)]">Transaktionen</div>
        <div className="mt-1 text-3xl font-semibold tracking-[-0.01em] tabular-nums text-[var(--text)]">
          {totals.count}
        </div>
        <div className="mt-1 text-xs text-[var(--muted)]">
          {totals.countPosted} gebucht, {totals.countCancelled} storniert
        </div>
      </div>
    </div>
  );
}
