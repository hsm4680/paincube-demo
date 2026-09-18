import React from "react";
import { BrainCircuit, Play, RefreshCw } from "lucide-react";
import paincubeLogo from "../assets/paincube-logo.png";
import { bedLabel, patientIdLabel, profileLabel } from "../data/patients.js";

export default function Header({ patient, onStart, onReset, demoRunning }) {
  return (
    <header className="flex flex-col gap-4 rounded-lg border border-hairline bg-card-surface px-4 py-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-5">
        <img src={paincubeLogo} alt="PainCube" className="h-12 w-auto sm:h-14" />
        <div className="min-w-[220px] border-l border-hairline pl-4 max-sm:border-l-0 max-sm:pl-0">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-panel sm:text-xs">
            <BrainCircuit className="h-4 w-4 text-brand-light" />
            Predictive Pain AI
          </div>
          <h1 className="mt-1 text-xl font-bold text-brand-navy sm:text-2xl">ICU PainCube CDSS Demo</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-hairline bg-page-bg text-sm">
          <PatientStat label="Patient" value={patientIdLabel(patient)} />
          <PatientStat label="Profile" value={profileLabel(patient)} />
          <PatientStat label="Location" value={bedLabel(patient)} />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-panel px-4 text-sm font-semibold text-white transition hover:bg-brand-navy"
          >
            <Play className="h-4 w-4" />
            Demo Start
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Reset demo"
            title="Reset demo"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-hairline bg-card-surface text-text-label transition hover:border-brand-light hover:text-brand-panel"
          >
            <RefreshCw className={`h-4 w-4 ${demoRunning ? "animate-spin-slow" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
}

function PatientStat({ label, value }) {
  return (
    <div className="border-r border-hairline px-4 py-2 last:border-r-0">
      <div className="text-[11px] uppercase tracking-[0.12em] text-text-label">{label}</div>
      <div className="mt-0.5 whitespace-nowrap font-semibold text-text-primary">{value}</div>
    </div>
  );
}
