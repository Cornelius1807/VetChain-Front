"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiMe, apiOwnerCitas } from "../../lib/services/api";
import type { CitaDTO, DuenoDTO } from "../../lib/types/api";

export default function OwnerHome() {
  const [owner, setOwner] = useState<DuenoDTO | null>(null);
  const [citas, setCitas] = useState<CitaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [meRes, citasRes] = await Promise.all([apiMe(), apiOwnerCitas()]);
        setOwner(meRes.dueno ?? null);
        setCitas(citasRes);
      } catch {
        setError("No se pudo cargar tu panel. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const proximas = useMemo(() => {
    const ahora = Date.now();
    return citas
      .filter((c) => new Date(c.fecha).getTime() >= ahora)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 5);
  }, [citas]);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-8">Cargando...</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">Hola {owner?.nombres ?? owner?.apellidos ?? "dueno"}</h1>
        <p className="text-slate-600 mt-1">Administra a tus mascotas y agenda tus citas.</p>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/owner/mascotas" className="rounded-lg border bg-white p-6 hover:shadow-sm">
          <p className="text-lg font-medium text-slate-900">Mascotas</p>
          <p className="text-sm text-slate-600">Registrar, editar o eliminar</p>
        </Link>
        <Link href="/owner/citas" className="rounded-lg border bg-white p-6 hover:shadow-sm">
          <p className="text-lg font-medium text-slate-900">Citas</p>
          <p className="text-sm text-slate-600">Agenda y consulta el estado</p>
        </Link>
      </div>

      <section>
        <h2 className="text-lg font-medium mb-3 text-slate-900">Proximas citas</h2>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        {proximas.length === 0 ? (
          <p className="text-sm text-slate-600">Aun no tienes citas registradas.</p>
        ) : (
          <ul className="divide-y rounded-md border bg-white">
            {proximas.map((cita) => (
              <li key={cita.id} className="p-3 text-sm flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">{formatDateTime(cita.fecha)}</p>
                  <p className="text-xs text-slate-500">Motivo: {cita.motivo}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">{cita.estado}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}
