"use client";

import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Panel de Administración</h1>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/centros" className="rounded-lg border p-6 hover:shadow-sm">
          <div className="text-lg font-medium">Centros Veterinarios</div>
          <div className="text-sm text-slate-600">Crear y gestionar centros</div>
        </Link>
        <Link href="/admin/cuentas" className="rounded-lg border p-6 hover:shadow-sm">
          <div className="text-lg font-medium">Cuentas</div>
          <div className="text-sm text-slate-600">Validación de veterinarios</div>
        </Link>
      </div>
    </div>
  );
}

