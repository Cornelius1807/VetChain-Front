"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { apiDisponibilidad, apiListCentros, apiMe, apiProgramarAgenda } from "../../../lib/services/api";
import type { CentroDTO, HorarioSlotDTO, MeResponse } from "../../../lib/types/api";

export default function AgendaVetPage() {
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [centros, setCentros] = useState<CentroDTO[]>([]);
  const [slots, setSlots] = useState<HorarioSlotDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    centroId: "",
    consultorioId: "",
    fechaInicio: "",
    fechaFin: "",
    horaInicio: "09:00",
    horaFin: "18:00",
    duracion: 30,
  });

  const vetId = profile?.veterinario?.id ?? "";

  const refreshSlots = useCallback(async () => {
    if (!vetId) return;
    setSlotsLoading(true);
    setError(null);
    try {
      const data = await apiDisponibilidad(vetId, form.centroId || undefined);
      setSlots(data);
    } catch {
      setError("No se pudo consultar la disponibilidad.");
    } finally {
      setSlotsLoading(false);
    }
  }, [vetId, form.centroId]);

  useEffect(() => {
    Promise.all([apiMe(), apiListCentros()])
      .then(([me, centrosResp]) => {
        setProfile(me);
        setCentros(centrosResp);
        if (me.veterinario?.centroId) {
          setForm((prev) => ({ ...prev, centroId: me.veterinario?.centroId ?? "" }));
        }
      })
      .catch(() => setError("No se pudo cargar la agenda."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!vetId) return;
    refreshSlots();
  }, [vetId, refreshSlots]);

  const summary = useMemo(() => {
    if (slots.length === 0) return "Sin horarios libres para mostrar.";
    const first = slots[0];
    const last = slots[slots.length - 1];
    return `Mostrando ${slots.length} horarios libres entre ${formatDateTime(first.fechaInicio)} y ${formatDateTime(
      last.fechaInicio
    )}`;
  }, [slots]);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-8">Cargando agenda...</div>;
  if (!profile?.veterinario) {
    return <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-red-600">No se encontro tu perfil de veterinario.</div>;
  }

  const puedeProgramar = !!profile.veterinario.centroId;

  async function handleProgram(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setError(null);

    if (!form.centroId) {
      setError("Selecciona un centro.");
      return;
    }
    if (!form.fechaInicio || !form.fechaFin) {
      setError("Completa el rango de fechas.");
      return;
    }
    const inicio = new Date(form.fechaInicio);
    const fin = new Date(form.fechaFin);
    if (fin < inicio) {
      setError("El rango es invalido.");
      return;
    }
    const diffDays = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 14) {
      setError("Solo puedes programar hasta dos semanas seguidas.");
      return;
    }

    try {
      setSlotsLoading(true);
      await apiProgramarAgenda({
        centroId: form.centroId,
        consultorioId: form.consultorioId || undefined,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
        duracionMinutos: Number(form.duracion) || 30,
      });
      setFeedback("Agenda generada correctamente.");
      await refreshSlots();
    } catch {
      setError("No se pudo generar el horario. Verifica los datos.");
    } finally {
      setSlotsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Agenda y programacion</h1>
        <p className="text-sm text-slate-600">
          Crea bloques de atencion para las proximas dos semanas. Las citas confirmadas usaran estos horarios.
        </p>
        {!puedeProgramar && (
          <p className="text-sm text-amber-700">
            Aun no tienes un centro asignado. Solicita a un administrador que vincule tu cuenta.
          </p>
        )}
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {feedback && <p className="text-sm text-teal-700">{feedback}</p>}

      <section className="rounded-lg border bg-white p-5 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Nueva programacion</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleProgram}>
          <label className="grid gap-1">
            <span className="text-sm text-slate-700">Centro</span>
            <select
              className="rounded-md border px-3 py-2 text-sm"
              value={form.centroId}
              onChange={(e) => setForm((prev) => ({ ...prev, centroId: e.target.value }))}
              required
              disabled={!puedeProgramar}
            >
              <option value="">Seleccionar centro</option>
              {centros.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
          <Input
            name="consultorioId"
            label="Consultorio (opcional)"
            value={form.consultorioId}
            onChange={(e) => setForm((prev) => ({ ...prev, consultorioId: e.target.value }))}
            hint="ID o nombre referencial"
          />
          <Input
            name="fechaInicio"
            label="Fecha inicio"
            type="date"
            value={form.fechaInicio}
            onChange={(e) => setForm((prev) => ({ ...prev, fechaInicio: e.target.value }))}
            required
          />
          <Input
            name="fechaFin"
            label="Fecha fin"
            type="date"
            value={form.fechaFin}
            onChange={(e) => setForm((prev) => ({ ...prev, fechaFin: e.target.value }))}
            required
          />
          <Input
            name="horaInicio"
            label="Hora inicio"
            type="time"
            value={form.horaInicio}
            onChange={(e) => setForm((prev) => ({ ...prev, horaInicio: e.target.value }))}
            required
          />
          <Input
            name="horaFin"
            label="Hora fin"
            type="time"
            value={form.horaFin}
            onChange={(e) => setForm((prev) => ({ ...prev, horaFin: e.target.value }))}
            required
          />
          <Input
            name="duracion"
            label="Duracion (min)"
            type="number"
            min={15}
            max={120}
            value={form.duracion}
            onChange={(e) => setForm((prev) => ({ ...prev, duracion: Number(e.target.value) }))}
          />
          <div className="md:col-span-2">
            <Button type="submit" disabled={!puedeProgramar || slotsLoading}>
              {slotsLoading ? "Guardando..." : "Generar horarios"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border bg-white p-5 space-y-3">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Horarios libres</h2>
            <p className="text-xs text-slate-500">{summary}</p>
          </div>
          <Button type="button" variant="secondary" onClick={refreshSlots} disabled={slotsLoading}>
            {slotsLoading ? "Actualizando..." : "Actualizar"}
          </Button>
        </header>
        {slots.length === 0 ? (
          <p className="text-sm text-slate-600">No hay horarios libres cargados.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {slots.slice(0, 12).map((slot) => (
              <li key={slot.id} className="rounded-md border px-3 py-2 text-sm">
                <p className="font-semibold text-slate-900">{formatDateTime(slot.fechaInicio)}</p>
                <p className="text-xs text-slate-500">
                  {formatTime(slot.fechaInicio)} - {formatTime(slot.fechaFin)}
                </p>
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

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
