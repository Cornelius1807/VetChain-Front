"use client";

import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Panel de administracion</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/admin/centros" className="rounded-lg border p-6 hover:shadow-sm">
          <div className="text-lg font-medium">Centros veterinarios</div>
          <div className="text-sm text-slate-600">Crear y gestionar centros</div>
        </Link>
        <Link href="/admin/cuentas" className="rounded-lg border p-6 hover:shadow-sm">
          <div className="text-lg font-medium">Cuentas</div>
          <div className="text-sm text-slate-600">Validacion de veterinarios</div>
        </Link>
      </div>
    </div>
  );
}
