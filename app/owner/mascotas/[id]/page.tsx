"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiHistorial } from "../../../../lib/services/api";
import type { HistorialResponse } from "../../../../lib/types/api";

export default function HistorialMascotaPage() {
  const params = useParams<{ id: string }>();
  const mascotaId = params?.id ? String(params.id) : "";
  const [historial, setHistorial] = useState<HistorialResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mascotaId) return;
    apiHistorial(mascotaId)
      .then(setHistorial)
      .catch(() => setError("No se pudo cargar el historial de la mascota."))
      .finally(() => setLoading(false));
  }, [mascotaId]);

  const entries = useMemo(() => historial?.citas ?? [], [historial]);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8">Cargando historial...</div>;
  if (error) return <ErrorState message={error} />;
  if (!historial) return <ErrorState message="No encontramos la mascota solicitada." />;

  const { mascota } = historial;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            <Link href="/owner/mascotas" className="text-teal-700 hover:underline">
              Volver a mis mascotas
            </Link>
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">{mascota.nombre}</h1>
          <p className="text-sm text-slate-600">
            {mascota.especie} - {mascota.raza} - {mascota.genero} - {mascota.edad} anos
          </p>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${mascota.activa ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
          {mascota.activa ? "Mascota activa" : "Mascota inactiva"}
        </span>
      </div>

      <section className="rounded-lg border bg-white p-4 space-y-2">
        <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Resumen</p>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Peso</dt>
            <dd className="text-sm text-slate-900">{mascota.peso ? `${mascota.peso} kg` : "No registrado"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Descripcion</dt>
            <dd className="text-sm text-slate-900">{mascota.descripcion || "Sin descripcion"}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border bg-white">
        <header className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Historial clinico</h2>
          <p className="text-xs text-slate-500">Solo lectura. Cada entrada corresponde a una cita.</p>
        </header>
        {entries.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">Aun no hay citas registradas para esta mascota.</p>
        ) : (
          <ul className="divide-y">
            {entries.map((cita) => (
              <li key={cita.id} className="px-4 py-4 space-y-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatDateTime(cita.fecha)} - {cita.estado}
                    </p>
                    <p className="text-xs text-slate-500">Motivo: {cita.motivo}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    Veterinario: {cita.veterinario?.nombre ?? "Pendiente"} - Centro: {cita.centro?.nombre ?? "No asignado"}
                  </span>
                </div>
                {cita.hallazgos && <Field label="Hallazgos" value={cita.hallazgos} />}
                {cita.tratamiento && <Field label="Tratamiento" value={cita.tratamiento} />}
                {cita.pruebas && <Field label="Pruebas" value={cita.pruebas} />}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="text-sm text-slate-800 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-4">
      <p className="text-sm text-red-600">{message}</p>
      <Link href="/owner/mascotas" className="inline-flex items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white">
        Volver a la lista
      </Link>
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
