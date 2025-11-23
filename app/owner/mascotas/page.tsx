"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { apiCreatePet, apiDeletePet, apiListPets } from "../../../lib/services/api";
import type { MascotaDTO } from "../../../lib/types/api";

export default function MascotasPage() {
  const [mascotas, setMascotas] = useState<MascotaDTO[]>([]);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    apiListPets()
      .then(setMascotas)
      .catch(() => setError("No se pudieron cargar tus mascotas."))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const formData = new FormData(event.currentTarget);
    const edad = Number(formData.get("edad") || NaN);
    if (Number.isNaN(edad)) {
      setFormError("Ingresa una edad valida.");
      return;
    }

    const payload = {
      nombre: String(formData.get("nombre") || ""),
      especie: String(formData.get("especie") || ""),
      raza: String(formData.get("raza") || ""),
      genero: String(formData.get("genero") || ""),
      edad,
      peso: formData.get("peso") ? Number(formData.get("peso")) : undefined,
      descripcion: String(formData.get("descripcion") || "") || undefined,
    };

    if (!payload.nombre || !payload.especie || !payload.raza || !payload.genero) {
      setFormError("Completa los campos obligatorios.");
      return;
    }

    try {
      setSaving(true);
      const nueva = await apiCreatePet(payload);
      setMascotas((prev) => [...prev, nueva]);
      event.currentTarget.reset();
      setAdding(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo registrar la mascota.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(mascota: MascotaDTO) {
    if (!mascota.activa) return;
    if (!window.confirm(`Deseas desactivar a ${mascota.nombre}? Sus historiales se conservaran en modo lectura.`)) return;
    try {
      setDeletingId(mascota.id);
      await apiDeletePet(mascota.id);
      setMascotas((prev) => prev.map((m) => (m.id === mascota.id ? { ...m, activa: false } : m)));
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-8">Cargando...</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Mis mascotas</h1>
          <p className="text-sm text-slate-600">Solo tu puedes ver y administrar esta informacion.</p>
        </div>
        {!adding && (
          <Button type="button" onClick={() => setAdding(true)}>
            Registrar mascota
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {adding && (
        <form onSubmit={handleAdd} className="grid gap-4 rounded-lg border bg-white p-4 sm:grid-cols-2">
          <Input name="nombre" label="Nombre" required />
          <Input name="especie" label="Especie" placeholder="Perro, gato..." required />
          <Input name="raza" label="Raza" required />
          <Input name="genero" label="Genero" placeholder="Macho / Hembra" required />
          <Input name="edad" label="Edad" type="number" min={0} required />
          <Input name="peso" label="Peso (kg)" type="number" min={0} step="0.1" />
          <label className="sm:col-span-2 grid gap-1">
            <span className="text-sm text-slate-700">Descripcion</span>
            <textarea name="descripcion" className="rounded-md border border-slate-300 px-3 py-2" rows={3} />
          </label>
          {formError && <p className="text-sm text-red-600 sm:col-span-2">{formError}</p>}
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setAdding(false)} disabled={saving}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {mascotas.length === 0 ? (
        <p className="text-sm text-slate-600">Registra tu primera mascota para acceder a su historial clinico.</p>
      ) : (
        <ul className="divide-y rounded-md border bg-white">
          {mascotas.map((m) => (
            <li key={m.id} className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  {m.nombre}
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      m.activa ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {m.activa ? "Activa" : "Inactiva"}
                  </span>
                </p>
                <p className="text-sm text-slate-600">
                  {m.especie} - {m.raza} - {m.genero} - {m.edad} anos
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link className="text-teal-700 hover:underline" href={`/owner/mascotas/${m.id}`}>
                  Ver historial
                </Link>
                <Button variant="ghost" type="button" onClick={() => handleDelete(m)} disabled={!m.activa || deletingId === m.id}>
                  {m.activa ? (deletingId === m.id ? "Desactivando..." : "Desactivar") : "Inactiva"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
