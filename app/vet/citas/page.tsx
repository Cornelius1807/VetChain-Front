"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import { apiAtenderCita, apiCancelarCita, apiVetCitas } from "../../../lib/services/api";
import type { CitaDTO } from "../../../lib/types/api";

export default function VetCitasPage() {
  const [citas, setCitas] = useState<CitaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    apiVetCitas()
      .then(setCitas)
      .catch(() => setError("No se pudieron cargar tus citas."))
      .finally(() => setLoading(false));
  }, []);

  const proximas = useMemo(() => {
    const now = Date.now();
    return [...citas].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()).filter((c) => {
      if (c.estado === "Cancelada" || c.estado === "Rechazada") return true;
      return new Date(c.fecha).getTime() >= now;
    });
  }, [citas]);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-8">Cargando citas...</div>;

  async function confirmCita(cita: CitaDTO) {
    try {
      setActionId(cita.id);
      await apiAtenderCita(cita.id, { estado: "Confirmada" });
      setCitas((prev) => prev.map((c) => (c.id === cita.id ? { ...c, estado: "Confirmada" } : c)));
    } catch {
      alert("No se pudo confirmar la cita.");
    } finally {
      setActionId(null);
    }
  }

  async function cancelarCita(cita: CitaDTO) {
    const motivo = window.prompt("Motivo de cancelacion:");
    if (!motivo) return;
    try {
      setActionId(cita.id);
      await apiCancelarCita(cita.id, motivo);
      setCitas((prev) => prev.map((c) => (c.id === cita.id ? { ...c, estado: "Cancelada", motivoCancelacion: motivo } : c)));
    } catch {
      alert("No se pudo cancelar la cita.");
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Citas asignadas</h1>
        <p className="text-sm text-slate-600">Confirma, atiende o rechaza las citas dentro del plazo permitido.</p>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {proximas.length === 0 ? (
        <p className="text-sm text-slate-600">Aun no tienes citas registradas.</p>
      ) : (
        <ul className="divide-y rounded-md border bg-white">
          {proximas.map((cita) => (
            <li key={cita.id} className="p-4 space-y-2">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {formatDateTime(cita.fecha)} - {cita.estado}
                  </p>
                  <p className="text-xs text-slate-500">
                    Mascota: {cita.mascota?.nombre ?? "N/D"} | Dueno: {cita.dueno?.nombres ?? "N/D"} | Centro:{" "}
                    {cita.centro?.nombre ?? "Pendiente"}
                  </p>
                  {cita.motivoCancelacion && (
                    <p className="text-xs text-red-600">Cancelada por: {cita.motivoCancelacion}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  {cita.estado === "Programada" && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => confirmCita(cita)}
                      disabled={actionId === cita.id}
                    >
                      {actionId === cita.id ? "Confirmando..." : "Confirmar"}
                    </Button>
                  )}
                  {(cita.estado === "Programada" || cita.estado === "Confirmada") && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => cancelarCita(cita)}
                      disabled={actionId === cita.id}
                    >
                      {actionId === cita.id ? "Cancelando..." : "Cancelar"}
                    </Button>
                  )}
                  <Link className="text-teal-700 hover:underline" href={`/vet/citas/${cita.id}`}>
                    Ver/Atender
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
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
