"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import OwnerSidebar from "../../../components/owner/Sidebar";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import {
  apiCancelarCita,
  apiCrearCita,
  apiDisponibilidad,
  apiListCentros,
  apiListPets,
  apiListVetsActivos,
  apiMe,
  apiOwnerCitas,
  isAxiosError,
} from "../../../lib/services/api";
import type { CentroDTO, CitaDTO, HorarioSlotDTO, MascotaDTO, VeterinarioDTO } from "../../../lib/types/api";
import DogImage from "../../../src/assets/perro.png";

const monthFormatter = new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric" });
const dayFormatter = new Intl.DateTimeFormat("es-PE", { weekday: "short", day: "2-digit" });
const timeFormatter = new Intl.DateTimeFormat("es-PE", { hour: "2-digit", minute: "2-digit" });

type DayGroup = { key: string; label: string; slots: HorarioSlotDTO[]; date: Date };

export default function CitasOwnerPage() {
  const [ownerName, setOwnerName] = useState<string | undefined>();
  const [ownerAvatar, setOwnerAvatar] = useState<string | null>(null);
  const [mascotas, setMascotas] = useState<MascotaDTO[]>([]);
  const [veterinarios, setVeterinarios] = useState<VeterinarioDTO[]>([]);
  const [centros, setCentros] = useState<CentroDTO[]>([]);
  const [citas, setCitas] = useState<CitaDTO[]>([]);
  const [slots, setSlots] = useState<HorarioSlotDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const [mascotaId, setMascotaId] = useState("");
  const [vetId, setVetId] = useState("");
  const [centroId, setCentroId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    Promise.all([apiMe(), apiListPets(), apiListVetsActivos(), apiListCentros(), apiOwnerCitas()])
      .then(([me, pets, vets, centrosResp, citasResp]) => {
        setOwnerName(me.dueno ? `${me.dueno.nombres} ${me.dueno.apellidos}` : me.cuenta.correo);
        setOwnerAvatar(me.cuenta.avatarURL ?? null);
        setMascotas(pets);
        setVeterinarios(vets);
        setCentros(centrosResp);
        setCitas(citasResp);
        if (vets.length > 0) setVetId(vets[0].id);
      })
      .catch(() => setFormError("No se pudo cargar tu agenda."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!vetId) {
      setSlots([]);
      setSlotId("");
      return;
    }
    setSlotsLoading(true);
    apiDisponibilidad(vetId, centroId || undefined)
      .then((data) => {
        setSlots(data);
        setSlotId("");
      })
      .catch(() => setFormError("No se pudo consultar la disponibilidad."))
      .finally(() => setSlotsLoading(false));
  }, [vetId, centroId]);

  useEffect(() => {
    if (!vetId) return;
    const vet = veterinarios.find((v) => v.id === vetId);
    if (!vet) return;
    setCentroId((prev) => {
      if (vet.centroId) return vet.centroId === prev ? prev : vet.centroId;
      return prev ? "" : prev;
    });
  }, [vetId, veterinarios]);

  const petById = useMemo(() => {
    const map = new Map<string, MascotaDTO>();
    mascotas.forEach((m) => map.set(m.id, m));
    return map;
  }, [mascotas]);

  const slotsDisponibles = useMemo(() => {
    const ahora = Date.now();
    const limite = ahora + 14 * 24 * 60 * 60 * 1000;
    return slots.filter((slot) => {
      const inicio = new Date(slot.fechaInicio).getTime();
      const diffHoras = (inicio - ahora) / 3600000;
      return slot.estado === "LIBRE" && inicio > ahora && inicio <= limite && diffHoras >= 24;
    });
  }, [slots]);

  const groupedDays: DayGroup[] = useMemo(() => {
    const map = new Map<string, DayGroup>();
    slotsDisponibles.forEach((slot) => {
      const date = new Date(slot.fechaInicio);
      const dateKey = date.toISOString().split("T")[0];
      const label = dayFormatter.format(date).replace(".", "");
      if (!map.has(dateKey)) {
        map.set(dateKey, { key: dateKey, label, slots: [], date });
      }
      map.get(dateKey)?.slots.push(slot);
    });
    const arr = Array.from(map.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
    return arr;
  }, [slotsDisponibles]);

  useEffect(() => {
    if (!selectedDay && groupedDays.length > 0) {
      setSelectedDay(groupedDays[0].key);
    }
  }, [groupedDays, selectedDay]);

  const slotsEnDia = useMemo(() => groupedDays.find((d) => d.key === selectedDay)?.slots ?? [], [groupedDays, selectedDay]);

  const citasOrdenadas = useMemo(
    () => [...citas].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()),
    [citas]
  );

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-8 text-white">Cargando agenda...</div>;

  async function handleCreateCita(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!mascotaId || !vetId || !slotId) {
      setFormError("Selecciona mascota y horario.");
      return;
    }
    try {
      setCreating(true);
      const cita = await apiCrearCita({
        mascotaId,
        veterinarioId: vetId,
        slotId,
        motivo: motivo || "Consulta general",
      });
      setCitas((prev) => [...prev, cita]);
      setSlotId("");
      setMotivo("");
      await refreshSlots();
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        setFormError(err.response.data.error);
      } else {
        setFormError(err instanceof Error ? err.message : "No se pudo registrar la cita.");
      }
    } finally {
      setCreating(false);
    }
  }

  async function refreshSlots() {
    if (!vetId) return;
    try {
      const data = await apiDisponibilidad(vetId, centroId || undefined);
      setSlots(data);
    } catch {
      // ignore
    }
  }

  async function handleCancel(cita: CitaDTO) {
    const motivoCancel = window.prompt("Motivo de cancelacion:");
    if (!motivoCancel) return;
    try {
      setCancelingId(cita.id);
      await apiCancelarCita(cita.id, motivoCancel);
      setCitas((prev) =>
        prev.map((c) => (c.id === cita.id ? { ...c, estado: "Cancelada", motivoCancelacion: motivoCancel } : c))
      );
    } catch {
      alert("No se pudo cancelar la cita.");
    } finally {
      setCancelingId(null);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <OwnerSidebar ownerName={ownerName} avatarUrl={ownerAvatar} active="citas" />
      <div className="flex-1 space-y-8 px-4 py-8 md:px-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
          <header className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-teal-600">Nueva cita</p>
              <h1 className="text-3xl font-semibold">Organiza tu próxima visita</h1>
              <p className="text-sm text-slate-500">Selecciona el veterinario y horario disponible.</p>
            </div>
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs text-slate-500">Veterinario</span>
                <select
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm"
                  value={vetId}
                  onChange={(e) => {
                    setVetId(e.target.value);
                    setSelectedDay("");
                  }}
                >
                  {veterinarios.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nombre} {v.apellidos ?? ""} · {v.especialidad}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-slate-500">Centro</span>
                <select
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm"
                  value={centroId}
                  onChange={(e) => setCentroId(e.target.value)}
                >
                  <option value="">
                    Cualquiera
                  </option>
                  {centros.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </header>

          <form className="mt-6 grid gap-6" onSubmit={handleCreateCita}>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Agenda disponible</h2>
                <span className="text-sm text-slate-500">{monthFormatter.format(new Date())}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {groupedDays.length === 0 ? (
                  <p className="text-sm text-slate-500">No hay fechas disponibles.</p>
                ) : (
                  groupedDays.map((day) => (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => {
                        setSelectedDay(day.key);
                        setSlotId("");
                      }}
                      className={`rounded-full border px-4 py-2 text-sm ${
                        day.key === selectedDay ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 bg-white"
                      }`}
                    >
                      {day.label.toUpperCase()}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">Horarios disponibles</h3>
              {slotsLoading ? (
                <p className="text-sm text-slate-500">Consultando disponibilidad...</p>
              ) : slotsEnDia.length === 0 ? (
                <p className="text-sm text-slate-500">No hay horarios para el día seleccionado.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {slotsEnDia.map((slot) => (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => setSlotId(slot.id)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                        slot.id === slotId ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-900"
                      }`}
                    >
                      {timeFormatter.format(new Date(slot.fechaInicio))}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">Selecciona a tu mascota</h3>
              <div className="flex flex-wrap gap-4">
                {mascotas.map((mascota) => (
                  <button
                    key={mascota.id}
                    type="button"
                    onClick={() => setMascotaId(mascota.id)}
                    className={`flex min-w-[160px] flex-col items-center rounded-3xl border px-4 py-4 text-center ${
                      mascota.id === mascotaId ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 bg-white"
                    }`}
                  >
                    <Image src={DogImage} alt={mascota.nombre} className="h-16 w-16 rounded-full border border-white/40 object-cover" />
                    <p className="mt-3 text-base font-semibold">{mascota.nombre}</p>
                    <p className="text-xs text-slate-500">
                      {mascota.especie} · {mascota.raza}
                    </p>
                  </button>
                ))}
                {mascotas.length === 0 && <p className="text-sm text-slate-500">No tienes mascotas registradas.</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Indica el motivo de la visita</label>
              <Input
                name="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ingresa el motivo de tu visita..."
                className="rounded-2xl border-slate-200 bg-white text-slate-900"
              />
            </div>

            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <Button type="submit" disabled={creating} className="rounded-full bg-teal-600 px-8 py-3 text-white">
              {creating ? "Agendando..." : "Confirmar cita"}
            </Button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-teal-600">Tus citas</p>
              <h2 className="text-2xl font-semibold">Seguimiento</h2>
            </div>
          </header>
          {citasOrdenadas.length === 0 ? (
            <p className="text-sm text-slate-500">No tienes citas registradas.</p>
          ) : (
            <ul className="space-y-3">
              {citasOrdenadas.map((cita) => (
                <li
                  key={cita.id}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-4 text-sm md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-base font-semibold">
                      {formatDateTime(cita.fecha)} · {cita.estado}
                    </p>
                    <p className="text-slate-500">
                      Mascota: {resolveMascotaNombre(cita, petById)} — Veterinario: {cita.veterinario?.nombre ?? "N/D"}
                    </p>
                    {cita.motivoCancelacion && (
                      <p className="text-xs text-red-500">Cancelada por: {cita.motivoCancelacion}</p>
                    )}
                  </div>
                  {canCancel(cita) && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-teal-700"
                      onClick={() => handleCancel(cita)}
                      disabled={cancelingId === cita.id}
                    >
                      {cancelingId === cita.id ? "Cancelando..." : "Cancelar"}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function resolveMascotaNombre(cita: CitaDTO, map: Map<string, MascotaDTO>) {
  if (cita.mascota?.nombre) return cita.mascota.nombre;
  const local = map.get(cita.mascotaId);
  return local?.nombre ?? "N/D";
}

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function canCancel(cita: CitaDTO) {
  const estadoCancelable = cita.estado === "Programada" || cita.estado === "Confirmada";
  if (!estadoCancelable) return false;
  const fecha = new Date(cita.fecha).getTime();
  const tresHoras = 3 * 60 * 60 * 1000;
  return fecha - Date.now() > tresHoras;
}
