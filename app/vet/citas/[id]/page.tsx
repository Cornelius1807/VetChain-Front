"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import { apiAtenderCita, apiCancelarCita, apiVetCitas } from "../../../../lib/services/api";
import type { CitaDTO } from "../../../../lib/types/api";

export default function CitaDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const citaId = params?.id ?? "";
  const [cita, setCita] = useState<CitaDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState({ hallazgos: "", pruebas: "", tratamiento: "" });
  const [estado, setEstado] = useState<CitaDTO["estado"]>("Atendida");

  useEffect(() => {
    apiVetCitas()
      .then((lista) => {
        const found = lista.find((c) => c.id === citaId) ?? null;
        if (!found) {
          setError("No encontramos esta cita.");
        } else {
          setCita(found);
          setEstado(found.estado === "Confirmada" || found.estado === "Atendida" ? found.estado : "Atendida");
          setNotes({
            hallazgos: found.hallazgos ?? "",
            pruebas: found.pruebas ?? "",
            tratamiento: found.tratamiento ?? "",
          });
        }
      })
      .catch(() => setError("No se pudo cargar la cita."))
      .finally(() => setLoading(false));
  }, [citaId]);

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-8">Cargando cita...</div>;
  if (error || !cita) return <ErrorState message={error ?? "Cita no encontrada."} />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      await apiAtenderCita(cita.id, {
        estado,
        hallazgos: notes.hallazgos,
        pruebas: notes.pruebas,
        tratamiento: notes.tratamiento,
      });
      alert("Se guardaron los datos de la cita.");
      router.push("/vet/citas");
    } catch {
      alert("No se pudo registrar la atencion.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    const motivo = window.prompt("Motivo de cancelacion:");
    if (!motivo) return;
    try {
      setSaving(true);
      await apiCancelarCita(cita.id, motivo);
      alert("La cita fue cancelada.");
      router.push("/vet/citas");
    } catch {
      alert("No se pudo cancelar la cita.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-slate-500">
          <Link href="/vet/citas" className="text-teal-700 hover:underline">
            Volver a las citas
          </Link>
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">Cita con {cita.mascota?.nombre ?? "sin nombre"}</h1>
        <p className="text-sm text-slate-600">
          {formatDateTime(cita.fecha)} - Estado: {cita.estado}
        </p>
        <p className="text-xs text-slate-500">
          Dueno: {cita.dueno?.nombres ?? "N/D"} {cita.dueno?.apellidos ?? ""} | Centro: {cita.centro?.nombre ?? "Pendiente"}
        </p>
        {cita.motivoCancelacion && <p className="text-xs text-red-600">Motivo de cancelacion: {cita.motivoCancelacion}</p>}
      </header>

      <section className="rounded-lg border bg-white p-4 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Registrar atencion</h2>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1">
            <span className="text-sm text-slate-700">Estado</span>
            <select
              className="rounded-md border px-3 py-2 text-sm"
              value={estado}
              onChange={(e) => setEstado(e.target.value as CitaDTO["estado"])}
            >
              <option value="Atendida">Atendida</option>
              <option value="Confirmada">Solo confirmar asistencia</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-slate-700">Hallazgos</span>
            <textarea
              name="hallazgos"
              className="rounded-md border px-3 py-2 min-h-[90px]"
              value={notes.hallazgos}
              onChange={(e) => setNotes((prev) => ({ ...prev, hallazgos: e.target.value }))}
            />
          </label>
          <Input
            name="pruebas"
            label="Pruebas realizadas"
            value={notes.pruebas}
            onChange={(e) => setNotes((prev) => ({ ...prev, pruebas: e.target.value }))}
          />
          <label className="grid gap-1">
            <span className="text-sm text-slate-700">Tratamiento y ordenes</span>
            <textarea
              name="tratamiento"
              className="rounded-md border px-3 py-2 min-h-[120px]"
              value={notes.tratamiento}
              onChange={(e) => setNotes((prev) => ({ ...prev, tratamiento: e.target.value }))}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar atencion"}
            </Button>
            {(cita.estado === "Programada" || cita.estado === "Confirmada") && (
              <Button type="button" variant="ghost" onClick={handleCancel} disabled={saving}>
                Cancelar cita
              </Button>
            )}
            {cita.mascotaId && (
              <Link
                href={`/owner/mascotas/${cita.mascotaId}`}
                className="rounded-md border px-3 py-2 text-sm text-teal-700"
              >
                Ver historial de la mascota
              </Link>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
      <p className="text-sm text-red-600">{message}</p>
      <Link href="/vet/citas" className="inline-flex items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white">
        Ver todas las citas
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
