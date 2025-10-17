"use client";

import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export default function Input({ label, hint, className = "", ...props }: Props) {
  return (
    <label className="grid gap-1 w-full">
      {label && <span className="text-sm text-slate-700">{label}</span>}
      <input
        className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 ${className}`}
        {...props}
      />
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

