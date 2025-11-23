"use client";

import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import {
  apiApproveVet,
  apiListCentros,
  apiListPendingVets,
  apiRejectVet,
} from "../../../lib/services/api";
import type { CentroDTO, PendingVetDTO } from "../../../lib/types/api";
import { useSession } from "../../../lib/auth/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function CuentasAdminPage() {
  const [pendientes, setPendientes] = useState<PendingVetDTO[]>([]);
  const [centros, setCentros] = useState<CentroDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { cuenta, loading: sessionLoading } = useSession();
  const isAdmin = cuenta?.rol === "admin";
  const [seleccionCentro, setSeleccionCentro] = useState<Record<string, string>>({});
  const [permisoCentro, setPermisoCentro] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (sessionLoading) return;
    if (!isAdmin) {
      setError("Debes iniciar sesion como administrador.");
      setLoading(false);
      return;
    }
    Promise.all([apiListPendingVets(), apiListCentros()])
      .then(([vets, centrosResp]) => {
        setPendientes(vets);
        setCentros(centrosResp);
      })
      .catch(() => setError("No se pudieron cargar las cuentas pendientes."))
      .finally(() => setLoading(false));
  }, [sessionLoading, isAdmin]);

  async function refresh() {
    if (!isAdmin) return;
    const data = await apiListPendingVets();
    setPendientes(data);
  }

  async function handleApprove(vet: PendingVetDTO) {
    if (!isAdmin) return;
    setFeedback(null);
    try {
      setActionId(vet.id);
      await apiApproveVet(vet.id, {
        centroId: seleccionCentro[vet.id] || undefined,
        permitirCrearCentro: permisoCentro[vet.id],
      });
      setFeedback("Veterinario aprobado.");
      await refresh();
    } catch {
      alert("No se pudo aprobar la cuenta.");
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(vet: PendingVetDTO) {
    if (!isAdmin) return;
    const motivo = window.prompt("Escribe el motivo del rechazo:");
    if (!motivo) return;
    try {
      setActionId(vet.id);
      await apiRejectVet(vet.id, motivo);
      setFeedback("Veterinario rechazado y notificado.");
      await refresh();
    } catch {
      alert("No se pudo rechazar la cuenta.");
    } finally {
      setActionId(null);
    }
  }

  if (loading || sessionLoading) return <div className="mx-auto max-w-5xl px-4 py-8">Cargando cuentas...</div>;
  if (!isAdmin) {
    return <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-red-600">No tienes permiso para ver esta seccion.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Validacion de veterinarios</h1>
        <p className="text-sm text-slate-600">
          Revisa los documentos adjuntos y aprueba o rechaza la cuenta. La plataforma enviara la notificacion
          automaticamente.
        </p>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {feedback && <p className="text-sm text-teal-700">{feedback}</p>}

      {pendientes.length === 0 ? (
        <p className="text-sm text-slate-600">No hay cuentas pendientes.</p>
      ) : (
        <ul className="divide-y rounded-lg border bg-white">
          {pendientes.map((vet) => (
            <li key={vet.id} className="p-4 space-y-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {vet.nombre} {vet.apellidos ?? ""}
                  </p>
                  <p className="text-xs text-slate-500">{vet.especialidad || "General"}</p>
                  <p className="text-xs text-slate-500">
                    Cuenta: {vet.cuenta.correo} - DNI: {vet.dni}
                  </p>
                </div>
                <div className="flex gap-2 text-sm">
                  {docUrl(vet.tituloURL) && (
                    <a className="text-teal-700 hover:underline" href={docUrl(vet.tituloURL)!} target="_blank" rel="noreferrer">
                      Ver titulo
                    </a>
                  )}
                  {docUrl(vet.constanciaURL) && (
                    <a className="text-teal-700 hover:underline" href={docUrl(vet.constanciaURL)!} target="_blank" rel="noreferrer">
                      Ver constancia
                    </a>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Centro solicitado: {centroNombre(vet.centroId, centros) ?? "Sin asignar"}
              </p>
              <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-end sm:justify-between">
                <label className="flex-1">
                  <span className="text-xs uppercase tracking-wide text-slate-500">Asignar centro</span>
                  <select
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    value={seleccionCentro[vet.id] || ""}
                    onChange={(e) => setSeleccionCentro((prev) => ({ ...prev, [vet.id]: e.target.value }))}
                  >
                    <option value="">Sin asignar</option>
                    {centros.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mt-2 flex items-center gap-2 text-xs text-slate-600 sm:mt-0 sm:pl-4">
                  <input
                    type="checkbox"
                    className="rounded border-slate-400"
                    checked={permisoCentro[vet.id] ?? false}
                    onChange={(e) =>
                      setPermisoCentro((prev) => ({
                        ...prev,
                        [vet.id]: e.target.checked,
                      }))
                    }
                  />
                  Permitir que cree su propio centro
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => handleApprove(vet)} disabled={actionId === vet.id}>
                  {actionId === vet.id ? "Aprobando..." : "Aprobar"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => handleReject(vet)} disabled={actionId === vet.id}>
                  {actionId === vet.id ? "Rechazando..." : "Rechazar"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function centroNombre(id: string | null | undefined, centros: CentroDTO[]) {
  if (!id) return null;
  return centros.find((c) => c.id === id)?.nombre ?? null;
}

function docUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}${path}`;
}
