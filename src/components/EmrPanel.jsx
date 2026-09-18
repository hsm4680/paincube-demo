import React from "react";
import { Database } from "lucide-react";

export default function EmrPanel({ metrics }) {
  return (
    <section className="rounded-lg border border-hairline bg-card-surface p-5 shadow-sm lg:col-span-2 xl:col-span-1">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-panel">
        <Database className="h-4 w-4 text-brand-light" />
        EMR context
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <EmrFact label="Procedure" value={metrics.emr.procedure} />
        <EmrFact label="Pain report" value={metrics.emr.painReport} />
        <EmrFact label="Last analgesic" value={metrics.emr.lastAnalgesic} />
        <EmrFact label="Active medication" value={metrics.emr.activeMeds} />
        <EmrFact label="Sedation" value={metrics.emr.sedation} />
        <EmrFact label="Renal function" value={metrics.emr.renal} />
      </div>
    </section>
  );
}

function EmrFact({ label, value }) {
  return (
    <div className="rounded-md border border-hairline bg-page-bg px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.12em] text-text-label">{label}</div>
      <div className="mt-1 text-sm font-medium text-text-primary">{value}</div>
    </div>
  );
}
