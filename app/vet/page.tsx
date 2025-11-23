"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiMe, apiVetCitas } from "../../lib/services/api";
import type { CitaDTO, MeResponse } from "../../lib/types/api";

export default function VetHome() {
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [citas, setCitas] = useState<CitaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([apiMe(), apiVetCitas()])
      .then(([me, citasResp]) => {
        setProfile(me);
        setCitas(citasResp);
      })
      .catch(() => setError("No se pudo cargar tu panel."))
      .finally(() => setLoading(false));
  }, []);

  const proximas = useMemo(() => {
    const now = Date.now();
    return citas
      .filter((c) => new Date(c.fecha).getTime() >= now)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 5);
  }, [citas]);

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-8">Cargando...</div>;

  const estadoCuenta = profile?.cuenta.estado;
  const vet = profile?.veterinario;
  const requiresApproval = estadoCuenta !== "active";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Hola {vet?.nombre ?? profile?.cuenta.correo ?? "veterinario"}
        </h1>
        <p className="text-sm text-slate-600">Gestiona tu agenda y atiende a tus pacientes.</p>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {requiresApproval && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tu cuenta todavia no esta activa. Revisa tu correo para completar la verificacion cuando el administrador
          apruebe tus documentos.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CardLink href="/vet/agenda" title="Agenda" subtitle="Programa tus horarios" />
        <CardLink href="/vet/citas" title="Citas" subtitle="Confirma o atiende pacientes" />
        {vet?.puedeCrearCentro && (
          <CardLink href="/admin/centros" title="Crear centro" subtitle="Disponible para duenos de clinica" />
        )}
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Proximas citas</h2>
        {proximas.length === 0 ? (
          <p className="text-sm text-slate-600">Aun no tienes citas asignadas.</p>
        ) : (
          <ul className="divide-y rounded-md border bg-white">
            {proximas.map((cita) => (
              <li
                key={cita.id}
                className="flex flex-col gap-1 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{formatDateTime(cita.fecha)}</p>
                  <p className="text-xs text-slate-500">
                    Mascota: {cita.mascota?.nombre ?? "N/D"} - Dueno: {cita.dueno?.nombres ?? "N/D"}
                  </p>
                </div>
                <Link href={`/vet/citas/${cita.id}`} className="text-teal-700 hover:underline">
                  Ver detalle
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CardLink({ href, title, subtitle }: { href: string; title: string; subtitle: string }) {
  return (
    <Link href={href} className="rounded-lg border bg-white p-6 hover:shadow-sm transition">
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      <p className="text-sm text-slate-600">{subtitle}</p>
    </Link>
  );
}

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}
